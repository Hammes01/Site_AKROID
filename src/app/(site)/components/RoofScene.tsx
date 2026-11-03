'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { GROUPS, PANEL_COUNT, type InverterMode, type simulate } from '@/lib/inverter-sim'
import { createCellTexture, createInverter, createMicroinverter } from './solar-models'

type SimResult = ReturnType<typeof simulate>
export type Rect = { left: number; top: number; width: number; height: number }
export type Point = { left: number; top: number }
export type RoofLayout = { panels: Rect[]; inverter: Point; micros: Point[]; board: Point }

// Medidas em metros. Placa real 2384 x 1303 mm; o vão entre fileiras é exagerado
// para os microinversores e os cabos aparecerem.
const PANEL_W = 1.303
const PANEL_H = 2.384
const COL_GAP = 0.05
const ROW_GAP = 0.55
const PITCH = THREE.MathUtils.degToRad(30)
const ROOF_W = 7.6
const ROOF_L = 6.6
const WALL_H = 3
const WALL_FRONT = -0.5
const MARGIN_X = ROOF_W / 2 - 0.35

const SIN = Math.sin(PITCH)
const COS = Math.cos(PITCH)

// Coordenadas do telhado (x para o lado, y subindo a partir do beiral, z para fora da
// telha) convertidas para o mundo. O beiral fica em y = 0, z = 0.
function roof(x: number, y: number, z = 0) {
  return new THREE.Vector3(x, SIN * y + COS * z, -COS * y + SIN * z)
}

const COLUMN_X = Array.from({ length: 4 }, (_, i) => -(4 * PANEL_W + 3 * COL_GAP) / 2 + PANEL_W / 2 + i * (PANEL_W + COL_GAP))
const BOTTOM_ROW_Y = 0.55 + PANEL_H / 2
const TOP_ROW_Y = BOTTOM_ROW_Y + PANEL_H + ROW_GAP
const GAP_Y = BOTTOM_ROW_Y + PANEL_H / 2 + ROW_GAP / 2
const LIFT = 0.12

// Placa i: 0 a 3 na fileira de cima, 4 a 7 na de baixo
function panelCenter(i: number) {
  return { x: COLUMN_X[i % 4], y: i < 4 ? TOP_ROW_Y : BOTTOM_ROW_Y }
}
// Ponto da borda da placa voltada para o vão do meio
function gapEdge(i: number, dx = 0) {
  const { x } = panelCenter(i)
  return { x: x + dx, y: i < 4 ? GAP_Y + ROW_GAP / 2 - 0.08 : GAP_Y - ROW_GAP / 2 + 0.08 }
}

function tube(points: THREE.Vector3[], material: THREE.Material, radius = 0.03) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2)
  return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), radius, 8), material)
}

// Sombra suave, como a de uma árvore, desenhada num canvas
function createShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(0,0,0,0.85)')
  gradient.addColorStop(0.6, 'rgba(0,0,0,0.6)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

type CableRole = { mode: InverterMode; kind: 'dc'; group: number } | { mode: InverterMode; kind: 'ac' }

export default function RoofScene({
  mode,
  sim,
  onLayout,
}: {
  mode: InverterMode
  sim: SimResult
  onLayout: (layout: RoofLayout | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const updateRef = useRef<((mode: InverterMode, sim: SimResult) => void) | null>(null)
  const onLayoutRef = useRef(onLayout)

  useEffect(() => {
    onLayoutRef.current = onLayout
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      // Sem WebGL, a seção funciona pela lista de placas ao lado
      onLayoutRef.current(null)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = environment.texture
    scene.environmentIntensity = 0.6

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80)
    const sun = new THREE.DirectionalLight(0xfff2d9, 2.4)
    sun.position.set(4, 8, 6)
    scene.add(sun, new THREE.HemisphereLight(0xcfe3ff, 0x1e293b, 0.6))

    const disposables: { dispose: () => void }[] = [environment, pmrem]
    const keep = <T extends { dispose: () => void }>(item: T) => {
      disposables.push(item)
      return item
    }

    // Casa: parede com o beiral e telhado metálico com nervuras
    const wallMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xd8dde3, roughness: 0.9 }))
    const wall = new THREE.Mesh(new THREE.BoxGeometry(ROOF_W - 0.6, WALL_H, 0.3), wallMaterial)
    wall.position.set(0, -WALL_H / 2 - 0.05, WALL_FRONT - 0.15)
    scene.add(wall)

    const roofGroup = new THREE.Group()
    roofGroup.rotation.x = -(Math.PI / 2 - PITCH)
    scene.add(roofGroup)
    const roofMaterial = keep(new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.5, roughness: 0.55 }))
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(ROOF_W, ROOF_L, 0.08), roofMaterial)
    roofSlab.position.set(0, ROOF_L / 2, -0.04)
    roofGroup.add(roofSlab)
    for (let x = -ROOF_W / 2 + 0.2; x < ROOF_W / 2; x += 0.38) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.05, ROOF_L, 0.05), roofMaterial)
      rib.position.set(x, ROOF_L / 2, 0.02)
      roofGroup.add(rib)
    }

    // Placas: textura de células compartilhada e um material por placa, para colorir o estado
    const cellTexture = keep(createCellTexture(PANEL_H / PANEL_W))
    const aluminum = keep(new THREE.MeshStandardMaterial({ color: 0x9aa1a9, metalness: 0.8, roughness: 0.5 }))
    const shadowMaterial = keep(
      new THREE.MeshBasicMaterial({ map: keep(createShadowTexture()), transparent: true, depthWrite: false })
    )
    const failMaterial = keep(new THREE.MeshBasicMaterial({ color: 0xef4444 }))
    const cellGeometry = keep(new THREE.BoxGeometry(PANEL_W - 0.06, PANEL_H - 0.06, 0.03))
    const panels = Array.from({ length: PANEL_COUNT }, (_, i) => {
      const { x, y } = panelCenter(i)
      const group = new THREE.Group()
      group.position.set(x, y, LIFT)
      const material = keep(new THREE.MeshStandardMaterial({ map: cellTexture, roughness: 0.45, metalness: 0 }))
      group.add(new THREE.Mesh(cellGeometry, material))
      const rails: [number, number, number, number][] = [
        [PANEL_W, 0.035, 0, PANEL_H / 2 - 0.0175],
        [PANEL_W, 0.035, 0, -PANEL_H / 2 + 0.0175],
        [0.035, PANEL_H, PANEL_W / 2 - 0.0175, 0],
        [0.035, PANEL_H, -PANEL_W / 2 + 0.0175, 0],
      ]
      rails.forEach(([w, h, rx, ry]) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), aluminum)
        rail.position.set(rx, ry, 0)
        group.add(rail)
      })

      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W * 1.5, PANEL_H * 0.9), shadowMaterial)
      shadow.position.z = 0.05
      group.add(shadow)

      const cross = new THREE.Group()
      ;[1, -1].forEach((side) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.09, PANEL_H * 0.7, 0.01), failMaterial)
        bar.rotation.z = side * 0.5
        cross.add(bar)
      })
      cross.position.z = 0.06
      group.add(cross)

      roofGroup.add(group)
      return { material, shadow, cross }
    })

    // Cabos: um material por estado, trocado conforme a simulação
    const cableMaterials = {
      energia: keep(new THREE.MeshStandardMaterial({ color: 0x3f6212, emissive: 0x7cc943, emissiveIntensity: 0.7 })),
      desligado: keep(new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.6 })),
      perigo: keep(new THREE.MeshStandardMaterial({ color: 0x7f1d1d, emissive: 0xef4444, emissiveIntensity: 1 })),
    }
    const cables: { mesh: THREE.Mesh; role: CableRole }[] = []
    const addCable = (points: THREE.Vector3[], role: CableRole, radius?: number) => {
      const mesh = tube(points, cableMaterials.desligado, radius)
      scene.add(mesh)
      cables.push({ mesh, role })
    }

    // Quadro de distribuição na parede: recebe o cabo CA nos dois modos
    const boxMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xeef1f3, roughness: 0.5 }))
    const board = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.6, 0.14, 3, 0.02), boxMaterial)
    const boardPosition = new THREE.Vector3(0.6, -1.5, WALL_FRONT + 0.07)
    board.position.copy(boardPosition)
    scene.add(board)

    // Desce do beiral pela parede até um ponto
    const downWall = (x: number, target: THREE.Vector3) => [
      roof(x, 0.15, 0.06),
      new THREE.Vector3(x, -0.15, WALL_FRONT + 0.05),
      new THREE.Vector3(x, target.y + 0.45, WALL_FRONT + 0.05),
      new THREE.Vector3(target.x, target.y + 0.4, WALL_FRONT + 0.05),
      target.clone(),
    ]

    // MODO STRING: duas séries de 4 (uma por fileira) até um inversor na parede
    const stringParts = new THREE.Group()
    scene.add(stringParts)
    const inverter = createInverter()
    inverter.scale.setScalar(0.22)
    const inverterPosition = new THREE.Vector3(2.4, -1.35, WALL_FRONT + 0.08)
    inverter.position.copy(inverterPosition)
    stringParts.add(inverter)

    GROUPS.string.forEach((group, groupIndex) => {
      // Ligação em série entre placas vizinhas, pela borda voltada para o vão
      for (let k = 0; k < group.length - 1; k++) {
        const a = gapEdge(group[k], PANEL_W * 0.3)
        const b = gapEdge(group[k + 1], -PANEL_W * 0.3)
        const sag = groupIndex === 0 ? -0.07 : 0.07
        addCable(
          [roof(a.x, a.y, 0.08), roof((a.x + b.x) / 2, a.y + sag, 0.08), roof(b.x, b.y, 0.08)],
          { mode: 'string', kind: 'dc', group: groupIndex }
        )
      }
      // Da última placa da série até o inversor
      const end = gapEdge(group[group.length - 1], PANEL_W * 0.3)
      const railX = MARGIN_X + groupIndex * 0.14
      const target = inverterPosition.clone().add(new THREE.Vector3(-0.08 + groupIndex * 0.08, -0.32, 0))
      addCable(
        [
          roof(end.x, end.y, 0.08),
          roof(railX, end.y, 0.08),
          roof(railX, 0.6, 0.08),
          ...downWall(railX, target).slice(0),
        ],
        { mode: 'string', kind: 'dc', group: groupIndex }
      )
    })
    addCable(
      [
        inverterPosition.clone().add(new THREE.Vector3(0.05, -0.33, 0)),
        new THREE.Vector3(inverterPosition.x, boardPosition.y - 0.55, WALL_FRONT + 0.05),
        new THREE.Vector3(boardPosition.x, boardPosition.y - 0.55, WALL_FRONT + 0.05),
        boardPosition.clone().add(new THREE.Vector3(0, -0.3, 0)),
      ],
      { mode: 'string', kind: 'ac' },
      0.035
    )

    // MODO MICRO: um microinversor para cada bloco de 2 x 2 placas, no vão do meio
    const microParts = new THREE.Group()
    scene.add(microParts)
    const microX = [(COLUMN_X[0] + COLUMN_X[1]) / 2, (COLUMN_X[2] + COLUMN_X[3]) / 2]
    const micros = microX.map((x) => {
      const micro = createMicroinverter()
      micro.scale.setScalar(0.24)
      micro.position.copy(roof(x, GAP_Y, 0.1))
      micro.rotation.x = -(Math.PI / 2 - PITCH)
      microParts.add(micro)
      return micro
    })
    GROUPS.micro.forEach((group, groupIndex) => {
      group.forEach((i) => {
        const edge = gapEdge(i)
        const mx = microX[groupIndex] + (edge.x < microX[groupIndex] ? -0.18 : 0.18)
        const my = GAP_Y + (i < 4 ? 0.05 : -0.05)
        addCable(
          [roof(edge.x, edge.y, 0.08), roof((edge.x + mx) / 2, (edge.y + my) / 2, 0.1), roof(mx, my, 0.1)],
          { mode: 'micro', kind: 'dc', group: groupIndex }
        )
      })
    })
    // Troncal CA: liga os dois microinversores e desce até o quadro
    addCable(
      [
        roof(microX[0] + 0.3, GAP_Y - 0.1, 0.1),
        roof(microX[1] - 0.3, GAP_Y - 0.1, 0.1),
        roof(microX[1] + 0.3, GAP_Y - 0.1, 0.1),
        roof(MARGIN_X, GAP_Y - 0.1, 0.08),
        roof(MARGIN_X, 0.6, 0.08),
        ...downWall(MARGIN_X, boardPosition.clone().add(new THREE.Vector3(0.1, 0.3, 0))),
      ],
      { mode: 'micro', kind: 'ac' },
      0.035
    )

    // Luz de estado de cada equipamento: verde funcionando, vermelha parado
    const ledGeometry = keep(new THREE.SphereGeometry(0.06, 16, 12))
    const ledOn = keep(new THREE.MeshStandardMaterial({ color: 0x7cc943, emissive: 0x7cc943, emissiveIntensity: 1 }))
    const ledOff = keep(new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1 }))
    const inverterLed = new THREE.Mesh(ledGeometry, ledOn)
    inverterLed.position.copy(inverterPosition).add(new THREE.Vector3(0, 0.42, 0.06))
    stringParts.add(inverterLed)
    const microLeds = microX.map((x) => {
      const led = new THREE.Mesh(ledGeometry, ledOn)
      led.position.copy(roof(x, GAP_Y + 0.2, 0.22))
      microParts.add(led)
      return led
    })

    // Câmera: enquadra telhado e parede, mais longe quando a tela é estreita
    const target = new THREE.Vector3(0, 0.55, -1.75)
    const elevation = THREE.MathUtils.degToRad(34)
    const fitCamera = () => {
      const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const distance = Math.max(4.55 / halfFov, 4.25 / (halfFov * camera.aspect))
      camera.position.set(0, target.y + Math.sin(elevation) * distance, target.z + Math.cos(elevation) * distance)
      camera.lookAt(target)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
    }

    // Posição das placas e dos equipamentos na tela, para os botões e rótulos por cima
    const project = (point: THREE.Vector3) => {
      const p = point.clone().project(camera)
      return { left: ((p.x + 1) / 2) * 100, top: ((1 - p.y) / 2) * 100 }
    }
    const reportLayout = () => {
      const panelRects = Array.from({ length: PANEL_COUNT }, (_, i) => {
        const { x, y } = panelCenter(i)
        const corners = [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ].map(([sx, sy]) => project(roof(x + (sx * PANEL_W) / 2, y + (sy * PANEL_H) / 2, LIFT)))
        const lefts = corners.map((c) => c.left)
        const tops = corners.map((c) => c.top)
        return {
          left: Math.min(...lefts),
          top: Math.min(...tops),
          width: Math.max(...lefts) - Math.min(...lefts),
          height: Math.max(...tops) - Math.min(...tops),
        }
      })
      onLayoutRef.current({
        panels: panelRects,
        inverter: project(inverterPosition.clone().add(new THREE.Vector3(0, -0.5, 0))),
        micros: microX.map((x) => project(roof(x, GAP_Y, 0.1))),
        board: project(boardPosition.clone().add(new THREE.Vector3(0, -0.45, 0))),
      })
    }

    const render = () => renderer.render(scene, camera)

    updateRef.current = (mode, sim) => {
      stringParts.visible = mode === 'string'
      microParts.visible = mode === 'micro'
      sim.panels.forEach((panel, i) => {
        const { material, shadow, cross } = panels[i]
        material.color.set(panel.status === 'parada' ? 0x4b5563 : 0xffffff)
        material.emissive.set(panel.status === 'reduzida' ? 0xd97706 : 0x000000)
        material.emissiveIntensity = panel.status === 'reduzida' ? 0.55 : 0
        shadow.visible = panel.shaded
        cross.visible = panel.failed
      })
      cables.forEach(({ mesh, role }) => {
        mesh.visible = role.mode === mode
        mesh.material = cableMaterials[role.kind === 'dc' ? sim.dcCables[role.group] : sim.acCable]
      })
      inverterLed.material = sim.equipmentDown[0] ? ledOff : ledOn
      microLeds.forEach((led, i) => {
        led.material = sim.equipmentDown[i] ? ledOff : ledOn
      })
      micros.forEach((micro) => (micro.visible = mode === 'micro'))
      render()
    }

    const resize = () => {
      const { clientWidth, clientHeight } = container
      if (!clientWidth || !clientHeight) return
      camera.aspect = clientWidth / clientHeight
      fitCamera()
      renderer.setSize(clientWidth, clientHeight)
      reportLayout()
      render()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    return () => {
      updateRef.current = null
      resizeObserver.disconnect()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const material = object.material as THREE.MeshStandardMaterial
          material.map?.dispose()
          material.emissiveMap?.dispose()
          material.dispose()
        }
      })
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  // Declarado depois da cena, para rodar quando ela já existe. Só redesenha quando
  // o estado muda: nada de animação contínua gastando bateria no celular.
  useEffect(() => {
    updateRef.current?.(mode, sim)
  }, [mode, sim])

  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0" />
}
