'use client'

import { useEffect, useRef } from 'react'
import type { MotionValue } from 'motion/react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import {
  FRAME_DEPTH,
  FRAME_FACE,
  PANEL_HEIGHT,
  PANEL_WIDTH,
  createCable,
  createCellTexture,
  createConnector,
  createInverter,
  createMicroinverter,
} from './solar-models'

// Altura, em pixels, do topo do site e do bloco de texto mais a barra inferior no celular.
const MOBILE_HEADER_HEIGHT = 72
const MOBILE_TEXT_HEIGHT = 340

// Interpola de 0 a 1 entre dois pontos do scroll, com início e fim suaves.
function ramp(p: number, start: number, end: number) {
  const t = Math.min(1, Math.max(0, (p - start) / (end - start)))
  return t * t * (3 - 2 * t)
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}


// Bifacial vidro-vidro (ex.: Canadian) ou vidro + backsheet transparente (ex.: BYD)
export type PanelVariant = 'vidro' | 'backsheet'


function createPanel() {
  const width = PANEL_WIDTH - FRAME_FACE * 2
  const height = PANEL_HEIGHT - FRAME_FACE * 2
  const group = new THREE.Group()

  const layer = (material: THREE.Material, thickness: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, thickness), material)
    group.add(mesh)
    return mesh
  }

  // Vidro frontal com antirreflexo: 2,0 mm no vidro-vidro e 3,2 mm no de backsheet.
  // As espessuras são exageradas para aparecer, mantendo a proporção entre elas.
  const glass = layer(
    new THREE.MeshPhysicalMaterial({
      color: 0xdff2ff,
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      opacity: 0.07,
      clearcoat: 1,
      envMapIntensity: 0.9,
    }),
    0.01
  )
  const encapsulant = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.5,
    transparent: true,
    opacity: 0,
  })
  const frontEncapsulant = layer(encapsulant, 0.004)
  const cells = layer(
    new THREE.MeshPhysicalMaterial({
      map: createCellTexture(height / width),
      // O antirreflexo das células devolve um reflexo azulado, não branco
      metalness: 0,
      roughness: 0.4,
      specularIntensity: 0.6,
      specularColor: 0x3a5cc4,
      envMapIntensity: 0.25,
    }),
    0.004
  )
  const backEncapsulant = layer(encapsulant, 0.004)

  // Traseira transparente nas duas variantes: dá para ver as células por trás
  const backGlass = new THREE.MeshPhysicalMaterial({
    color: 0xdff2ff,
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.1,
    clearcoat: 1,
    envMapIntensity: 0.9,
  })
  const clearBacksheet = new THREE.MeshStandardMaterial({
    color: 0xeef3f6,
    roughness: 0.6,
    transparent: true,
    opacity: 0.16,
  })
  const back = layer(backGlass, 0.01)

  const aluminum = new THREE.MeshStandardMaterial({ color: 0x9aa1a9, metalness: 0.8, roughness: 0.55 })
  const blackPlastic = new THREE.MeshStandardMaterial({ color: 0x14171a, roughness: 0.55 })

  const frame = new THREE.Group()
  const rails: [number, number, number, number][] = [
    [PANEL_WIDTH, FRAME_FACE, 0, (height + FRAME_FACE) / 2],
    [PANEL_WIDTH, FRAME_FACE, 0, -(height + FRAME_FACE) / 2],
    [FRAME_FACE, height, (width + FRAME_FACE) / 2, 0],
    [FRAME_FACE, height, -(width + FRAME_FACE) / 2, 0],
  ]
  rails.forEach(([w, h, x, y]) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w, h, FRAME_DEPTH), aluminum)
    rail.position.set(x, y, 0)
    frame.add(rail)
  })
  group.add(frame)

  // Caixa de junção IP68 dividida em três (uma por diodo de bypass), atrás da faixa do
  // meio. Cabos curtos (360 mm e 200 mm) com conectores.
  ;[-0.55, 0, 0.55].forEach((x) => {
    const box = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.09, 0.025, 2, 0.008), blackPlastic)
    box.position.set(x, 0, -0.018)
    back.add(box)
  })
  const cables: { points: [number, number, number][]; end: [number, number] }[] = [
    { points: [[-0.63, 0, -0.02], [-0.76, -0.04, -0.03], [-0.8, -0.25, -0.03], [-0.78, -0.5, -0.03]], end: [-0.78, -0.56] },
    { points: [[0.63, 0, -0.02], [0.74, -0.04, -0.03], [0.77, -0.22, -0.03]], end: [0.77, -0.28] },
  ]
  cables.forEach(({ points, end }) => {
    back.add(createCable(points, blackPlastic, 0.01))
    const connector = createConnector(blackPlastic)
    connector.scale.setScalar(0.4)
    connector.position.set(end[0], end[1], -0.03)
    back.add(connector)
  })

  const layers: { mesh: THREE.Object3D; assembled: number; exploded: number }[] = [
    { mesh: glass, assembled: 0.012, exploded: 1.5 },
    { mesh: frontEncapsulant, assembled: 0.006, exploded: 0.85 },
    { mesh: cells, assembled: 0, exploded: 0.2 },
    { mesh: backEncapsulant, assembled: -0.006, exploded: -0.42 },
    { mesh: back, assembled: -0.012, exploded: -1.05 },
    { mesh: frame, assembled: 0, exploded: -1.45 },
  ]

  const setVariant = (variant: PanelVariant) => {
    const glassBack = variant === 'vidro'
    back.material = glassBack ? backGlass : clearBacksheet
    back.scale.z = glassBack ? 1 : 0.4
    glass.scale.z = glassBack ? 1 : 1.6
  }

  return { group, layers, encapsulant, setVariant, extraMaterials: [backGlass, clearBacksheet] }
}

export default function ProductScene({
  progress,
  variant,
}: {
  progress: MotionValue<number>
  variant: PanelVariant
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const setVariantRef = useRef<((variant: PanelVariant) => void) | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      // Sem WebGL a seção continua funcionando só com os textos.
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
    scene.environmentIntensity = 0.75

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60)
    camera.position.z = 12

    const sun = new THREE.DirectionalLight(0xfff2d9, 2.6)
    sun.position.set(4, 5, 7)
    scene.add(sun)
    const rim = new THREE.DirectionalLight(0xcfe3ff, 0.8)
    rim.position.set(-6, 1, -5)
    scene.add(rim)

    const stage = new THREE.Group()
    scene.add(stage)

    const panel = createPanel()
    const inverter = createInverter()
    // O microinversor divide a cena com o inversor: os dois fazem a mesma conversão
    const microinverter = createMicroinverter()
    stage.add(panel.group, inverter, microinverter)

    let current = progress.get()
    let lastTime = 0
    let frame = 0
    let visible = false

    // Só desenha depois que os shaders estiverem prontos (ver compileAsync abaixo)
    let compiled = false
    let disposed = false

    const draw = (p: number) => {
      if (!compiled) return
      const wide = camera.aspect > 1.1
      const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const viewWidth = viewHeight * camera.aspect

      // Desktop: objeto à direita do texto. Celular: objeto no espaço entre o topo e o
      // texto, que muda conforme a altura da tela (ex.: barras do Safari no iPhone).
      if (wide) {
        stage.position.set(viewWidth * 0.2, 0, 0)
        stage.scale.setScalar(1)
      } else {
        const height = container.clientHeight
        const freeHeight = Math.max(height - MOBILE_HEADER_HEIGHT - MOBILE_TEXT_HEIGHT, 1)
        const centerFromTop = MOBILE_HEADER_HEIGHT + freeHeight / 2
        stage.position.set(0, ((height / 2 - centerFromTop) / height) * viewHeight, 0)
        stage.scale.setScalar(
          Math.min(0.92, viewWidth / 3.6, ((freeHeight / height) * viewHeight) / 3.6)
        )
      }

      // Placa solar: sobe, gira, abre em camadas, fecha e sai pela esquerda
      const panelIn = ramp(p, 0.02, 0.2)
      const panelTurn = ramp(p, 0.26, 0.36)
      const explode = ramp(p, 0.28, 0.37) * (1 - ramp(p, 0.44, 0.5))
      const panelOut = ramp(p, 0.49, 0.57)
      panel.group.visible = panelOut < 1
      panel.group.position.set(
        mix(0, -viewWidth * 1.1, panelOut),
        mix(-6.5, 0, panelIn),
        explode * 0.15
      )
      panel.group.rotation.set(
        mix(0.78, 0.1, panelIn) + panelTurn * 0.16,
        mix(-1.05, -0.24, panelIn) - panelTurn * 0.82 - panelOut * 0.9,
        mix(-0.12, 0, panelIn)
      )
      panel.group.scale.setScalar(1 - explode * 0.13)
      // O encapsulante é transparente na placa montada; só aparece ao abrir as camadas
      panel.encapsulant.opacity = 0.24 * explode
      panel.layers.forEach(({ mesh, assembled, exploded }) => {
        mesh.position.z = mix(assembled, exploded, explode)
      })

      // Inversor: entra pela direita, mostra a frente e gira até o dissipador
      const inverterIn = ramp(p, 0.52, 0.62)
      const inverterSpin = ramp(p, 0.62, 0.77)
      const inverterOut = ramp(p, 0.76, 0.83)
      // No celular os dois juntos ficam largos demais: diminui o conjunto
      const devices = wide ? 1 : 0.8
      inverter.scale.setScalar(devices)
      microinverter.scale.setScalar(0.62 * devices)
      inverter.visible = inverterIn > 0 && inverterOut < 1
      inverter.position.set(
        mix(viewWidth * 0.9, 0.75 * devices, inverterIn),
        mix(0.35, 6.5, inverterOut),
        0
      )
      inverter.rotation.set(
        mix(0.1, 0.03, inverterIn) + inverterSpin * 0.2,
        mix(1.5, -0.3, inverterIn) - inverterSpin * 2.2,
        0
      )

      // Microinversor: entra logo depois, à frente e abaixo do inversor, de face para a tela
      const microIn = ramp(p, 0.55, 0.65)
      microinverter.visible = microIn > 0 && inverterOut < 1
      microinverter.position.set(
        mix(viewWidth * 0.9, -0.7 * devices, microIn),
        mix(-1.3 * devices, 5.5, inverterOut),
        1.4
      )
      microinverter.rotation.set(
        mix(0.9, 0.35, microIn) + inverterSpin * 0.08,
        mix(-1.2, -0.05, microIn) - inverterSpin * 0.25,
        mix(0.3, 0.03, microIn)
      )

      // A luz acompanha o scroll e faz o reflexo correr pelas superfícies
      sun.position.x = mix(6, -3, p)
      sun.position.y = mix(5.5, 3, p)

      renderer.render(scene, camera)
    }

    const tick = (time: number) => {
      frame = 0
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 1 / 60
      lastTime = time

      // Amortece o scroll para o movimento continuar suave com a roda do mouse
      const target = progress.get()
      current += (target - current) * (1 - Math.exp(-delta * 7))
      if (Math.abs(target - current) < 0.0002) current = target
      draw(current)

      if (current !== target && visible) {
        frame = requestAnimationFrame(tick)
      } else {
        lastTime = 0
      }
    }

    const wake = () => {
      if (visible && !frame) frame = requestAnimationFrame(tick)
    }

    const unsubscribe = progress.on('change', wake)

    const resize = () => {
      const { clientWidth, clientHeight } = container
      if (!clientWidth || !clientHeight) return
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
      draw(current)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    // Não gasta GPU enquanto a seção está fora da tela
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      wake()
    })
    intersectionObserver.observe(container)

    setVariantRef.current = (variant) => {
      panel.setVariant(variant)
      draw(current)
    }

    // Prepara os shaders de todas as peças de uma vez, em segundo plano quando o
    // navegador permite. Sem isso, o primeiro quadro trava a página e o inversor
    // ainda engasga a rolagem quando aparece pela primeira vez.
    ;[panel.group, inverter, microinverter].forEach((object) => (object.visible = true))
    renderer
      .compileAsync(scene, camera)
      .catch(() => {})
      .finally(() => {
        if (disposed) return
        compiled = true
        draw(current)
      })

    return () => {
      disposed = true
      setVariantRef.current = null
      cancelAnimationFrame(frame)
      unsubscribe()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry.dispose()
        const material = object.material as THREE.MeshStandardMaterial
        material.map?.dispose()
        material.emissiveMap?.dispose()
        material.dispose()
      })
      panel.extraMaterials.forEach((material) => material.dispose())
      environment.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [progress])

  // Declarado depois da cena, para rodar quando ela já existe
  useEffect(() => {
    setVariantRef.current?.(variant)
  }, [variant])

  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0" />
}
