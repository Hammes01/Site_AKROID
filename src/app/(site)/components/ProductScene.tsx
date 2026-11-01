'use client'

import { useEffect, useRef } from 'react'
import type { MotionValue } from 'motion/react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Altura, em pixels, do topo do site e do bloco de texto mais a barra inferior no celular.
const MOBILE_HEADER_HEIGHT = 64
const MOBILE_TEXT_HEIGHT = 340

// Interpola de 0 a 1 entre dois pontos do scroll, com início e fim suaves.
function ramp(p: number, start: number, end: number) {
  const t = Math.min(1, Math.max(0, (p - start) / (end - start)))
  return t * t * (3 - 2 * t)
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// Textura das células: 6 x 10 células monocristalinas, com barramentos e dedos de prata.
function createCellTexture() {
  const cols = 6
  const rows = 10
  const size = 170
  const canvas = document.createElement('canvas')
  canvas.width = cols * size
  canvas.height = rows * size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#8f9aa6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = col * size + 3
      const y = row * size + 3
      const s = size - 6

      const gradient = ctx.createLinearGradient(x, y, x + s, y + s)
      gradient.addColorStop(0, '#071022')
      gradient.addColorStop(1, '#0e1c3a')
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, s, s)

      ctx.strokeStyle = 'rgba(190, 205, 225, 0.07)'
      ctx.lineWidth = 1
      for (let i = 4; i < s; i += 5) {
        ctx.beginPath()
        ctx.moveTo(x, y + i)
        ctx.lineTo(x + s, y + i)
        ctx.stroke()
      }

      ctx.fillStyle = 'rgba(225, 232, 240, 0.5)'
      for (let i = 1; i <= 4; i++) {
        ctx.fillRect(x + (s * i) / 5 - 1, y, 2, s)
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Visor do inversor: só indicadores gráficos, sem dados técnicos inventados.
function createDisplayTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#060a0d'
  ctx.fillRect(0, 0, 512, 256)

  const bars = [40, 62, 88, 118, 146, 164, 172, 160, 134, 102, 70, 44]
  bars.forEach((height, i) => {
    ctx.fillStyle = '#7cc943'
    ctx.fillRect(60 + i * 33, 215 - height, 22, height)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createCable(points: [number, number, number][], material: THREE.Material) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
  )
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.028, 10), material)
}

function createConnector(material: THREE.Material) {
  const group = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 16), material)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.07, 16), material)
  collar.position.y = 0.05
  group.add(body, collar)
  return group
}

function createPanel() {
  const width = 2.1
  const height = 3.5
  const group = new THREE.Group()

  const layer = (material: THREE.Material, thickness: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, thickness), material)
    group.add(mesh)
    return mesh
  }

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
    0.018
  )
  const encapsulant = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.5,
    transparent: true,
    opacity: 0,
  })
  const frontEva = layer(encapsulant, 0.01)
  const cells = layer(
    new THREE.MeshPhysicalMaterial({
      map: createCellTexture(),
      metalness: 0.2,
      roughness: 0.42,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.45,
    }),
    0.012
  )
  const backEva = layer(encapsulant, 0.01)
  const backsheet = layer(new THREE.MeshStandardMaterial({ color: 0xe8ebee, roughness: 0.75 }), 0.012)

  const aluminum = new THREE.MeshStandardMaterial({ color: 0xc4c9cf, metalness: 1, roughness: 0.34 })
  const blackPlastic = new THREE.MeshStandardMaterial({ color: 0x14171a, roughness: 0.55 })

  const frame = new THREE.Group()
  const bar = 0.06
  const depth = 0.13
  const rails: [number, number, number, number][] = [
    [width + bar * 2, bar, 0, height / 2 + bar / 2],
    [width + bar * 2, bar, 0, -height / 2 - bar / 2],
    [bar, height, width / 2 + bar / 2, 0],
    [bar, height, -width / 2 - bar / 2, 0],
  ]
  rails.forEach(([w, h, x, y]) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), aluminum)
    rail.position.set(x, y, -0.02)
    frame.add(rail)
  })
  group.add(frame)

  // Caixa de junção e cabos ficam presos ao backsheet
  const junction = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.26, 0.09, 3, 0.02), blackPlastic)
  junction.position.set(0, 1.2, -0.05)
  const leftCable = createCable(
    [
      [-0.12, 1.2, -0.06],
      [-0.42, 1.1, -0.1],
      [-0.5, 0.5, -0.12],
      [-0.44, 0.1, -0.1],
    ],
    blackPlastic
  )
  const rightCable = createCable(
    [
      [0.12, 1.2, -0.06],
      [0.42, 1.1, -0.1],
      [0.5, 0.5, -0.12],
      [0.44, 0.1, -0.1],
    ],
    blackPlastic
  )
  backsheet.add(junction, leftCable, rightCable)

  const layers = [
    { mesh: glass, assembled: 0.03, exploded: 1.5 },
    { mesh: frontEva, assembled: 0.018, exploded: 0.85 },
    { mesh: cells, assembled: 0.006, exploded: 0.2 },
    { mesh: backEva, assembled: -0.006, exploded: -0.42 },
    { mesh: backsheet, assembled: -0.018, exploded: -1.05 },
  ]

  return { group, layers, encapsulant }
}

function createInverter() {
  const group = new THREE.Group()
  const shell = new THREE.MeshPhysicalMaterial({
    color: 0xeef1f3,
    metalness: 0.15,
    roughness: 0.34,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
  })
  const finMetal = new THREE.MeshStandardMaterial({ color: 0x8c949c, metalness: 0.95, roughness: 0.38 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x15191d, roughness: 0.5 })

  group.add(new THREE.Mesh(new RoundedBoxGeometry(2, 2.8, 0.62, 6, 0.09), shell))

  const display = new THREE.Mesh(
    new RoundedBoxGeometry(1.15, 0.58, 0.03, 3, 0.012),
    new THREE.MeshStandardMaterial({
      map: createDisplayTexture(),
      emissive: 0xffffff,
      emissiveMap: createDisplayTexture(),
      emissiveIntensity: 0.55,
      roughness: 0.14,
    })
  )
  display.position.set(0, 0.55, 0.315)
  group.add(display)

  const ledColors = [0x7cc943, 0x7cc943, 0xf3b23a]
  ledColors.forEach((color, i) => {
    const led = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.012, 16),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: i === 2 ? 0.1 : 0.7 })
    )
    led.rotation.x = Math.PI / 2
    led.position.set(-0.14 + i * 0.14, 0.06, 0.315)
    group.add(led)
  })

  // Dissipador de calor na traseira
  for (let i = 0; i < 17; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.46, 0.3), finMetal)
    fin.position.set(-0.84 + i * 0.105, 0, -0.42)
    group.add(fin)
  }

  // Conectores CC, prensa-cabo CA e chave seccionadora na base
  for (let i = 0; i < 4; i++) {
    const connector = createConnector(dark)
    connector.position.set(-0.72 + i * 0.2, -1.5, 0.02)
    group.add(connector)
  }
  const gland = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 6), dark)
  gland.position.set(0.3, -1.49, 0.02)
  group.add(gland)
  const switchKnob = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.13, 0.14, 3, 0.03), dark)
  switchKnob.position.set(0.72, -1.47, 0.02)
  group.add(switchKnob)

  return group
}

function createMicroinverter() {
  const group = new THREE.Group()
  const anodized = new THREE.MeshStandardMaterial({ color: 0x3b4148, metalness: 0.9, roughness: 0.4 })
  const cableMaterial = new THREE.MeshStandardMaterial({ color: 0x101316, roughness: 0.55 })

  group.add(new THREE.Mesh(new RoundedBoxGeometry(2, 1.45, 0.3, 5, 0.05), anodized))

  // Aletas de dissipação na face superior
  for (let i = 0; i < 12; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.05, 0.075), anodized)
    rib.position.set(0, -0.6 + i * 0.109, 0.175)
    group.add(rib)
  }

  // Abas de fixação no trilho
  ;[-1.18, 1.18].forEach((x) => {
    const ear = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.52, 0.05, 3, 0.02), anodized)
    ear.position.set(x, 0, -0.12)
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.06, 20),
      new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.9 })
    )
    hole.rotation.x = Math.PI / 2
    hole.position.set(x > 0 ? 0.06 : -0.06, 0, 0.002)
    ear.add(hole)
    group.add(ear)
  })

  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x7cc943, emissive: 0x7cc943, emissiveIntensity: 0.9 })
  )
  led.position.set(0.86, -0.665, 0.14)
  group.add(led)

  // Dois pares de cabos CC saindo por cima e o cabo CA pela base
  ;[-0.65, -0.35, 0.35, 0.65].forEach((x, i) => {
    const side = x < 0 ? -1 : 1
    const reach = i % 3 === 0 ? 1.15 : 0.82
    group.add(
      createCable(
        [
          [x, 0.72, 0],
          [x + side * 0.05, 1.02, 0.03],
          [x + side * 0.28, 1.32, -0.06],
          [x + side * reach * 0.62, 1.52, -0.02],
        ],
        cableMaterial
      )
    )
    const connector = createConnector(cableMaterial)
    connector.position.set(x + side * reach * 0.62 + side * 0.08, 1.57, -0.02)
    connector.rotation.z = -side * 1.05
    group.add(connector)
  })
  group.add(
    createCable(
      [
        [0, -0.72, 0],
        [0.04, -1.0, 0.05],
        [0.32, -1.24, -0.06],
        [0.85, -1.33, 0],
      ],
      cableMaterial
    )
  )

  return group
}

export default function ProductScene({ progress }: { progress: MotionValue<number> }) {
  const containerRef = useRef<HTMLDivElement>(null)

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
    const microinverter = createMicroinverter()
    stage.add(panel.group, inverter, microinverter)

    let current = progress.get()
    let lastTime = 0
    let frame = 0
    let visible = false

    const draw = (p: number) => {
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
      inverter.visible = inverterIn > 0 && inverterOut < 1
      inverter.position.set(
        mix(viewWidth * 0.9, 0, inverterIn),
        mix(0, 6.5, inverterOut),
        0
      )
      inverter.rotation.set(
        mix(0.1, 0.03, inverterIn) + inverterSpin * 0.2,
        mix(1.5, -0.3, inverterIn) - inverterSpin * 2.2,
        0
      )

      // Microinversor: sobe de baixo e vira até ficar deitado em perspectiva
      const microIn = ramp(p, 0.8, 0.9)
      const microTurn = ramp(p, 0.88, 1)
      microinverter.visible = microIn > 0
      microinverter.position.set(0, mix(-6.5, 0, microIn), 0)
      microinverter.rotation.set(
        mix(1.2, 0.18, microIn) - microTurn * 0.82,
        mix(-1.2, -0.3, microIn) + microTurn * 0.72,
        mix(0.45, 0.06, microIn) - microTurn * 0.06
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

    return () => {
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
      environment.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [progress])

  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0" />
}
