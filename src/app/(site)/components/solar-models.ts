// Modelos 3D compartilhados pela animação de scroll e pela comparação de inversores.
// Só rodam no navegador (usam canvas e WebGL).

import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Medidas reais do módulo (datasheet Canadian CS7N-715TB-AG): 2384 x 1303 x 33 mm
export const PANEL_HEIGHT = 3.6
export const MM = PANEL_HEIGHT / 2384
export const PANEL_WIDTH = 1303 * MM
export const FRAME_DEPTH = 33 * MM
export const FRAME_FACE = 20 * MM

// Textura das células: 132 meias-células TOPCon em 2 x (11 x 6), com multibusbar fino.
// Os vãos são pintados escuros: com transparência, as células sumiriam de longe.
export function createCellTexture(aspect: number) {
  const cols = 6
  const rowsPerHalf = 11
  const cellWidth = 160
  const cellHeight = 80
  const gap = 4
  const margin = 12
  const width = cols * cellWidth + margin * 2
  const height = Math.round(width * aspect)
  // Faixa do meio, onde ficam as fitas de interligação e, atrás, a caixa de junção
  const middle = height - rowsPerHalf * 2 * cellHeight - margin * 2

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#272e38'
  ctx.fillRect(0, 0, width, height)

  const middleTop = margin + rowsPerHalf * cellHeight
  ctx.fillStyle = '#1c2128'
  ctx.fillRect(margin, middleTop, width - margin * 2, middle)
  ctx.fillStyle = 'rgba(205, 212, 220, 0.55)'
  ctx.fillRect(margin, middleTop + middle * 0.3, width - margin * 2, 3)
  ctx.fillRect(margin, middleTop + middle * 0.7 - 3, width - margin * 2, 3)

  for (let half = 0; half < 2; half++) {
    for (let row = 0; row < rowsPerHalf; row++) {
      for (let col = 0; col < cols; col++) {
        const x = margin + col * cellWidth + gap / 2
        const y = margin + half * (rowsPerHalf * cellHeight + middle) + row * cellHeight + gap / 2
        const w = cellWidth - gap
        const h = cellHeight - gap

        ctx.fillStyle = '#050d22'
        ctx.fillRect(x, y, w, h)

        // Dedos de coleta, quase invisíveis
        ctx.fillStyle = 'rgba(170, 185, 210, 0.05)'
        for (let i = 2; i < h; i += 3) ctx.fillRect(x, y + i, w, 1)

        // Multibusbar: muitos fios finos no sentido da string
        ctx.fillStyle = 'rgba(200, 210, 225, 0.11)'
        for (let i = 1; i <= 16; i++) ctx.fillRect(x + (w * i) / 17, y, 1, h)
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

// Visor do inversor: só indicadores gráficos, sem dados técnicos inventados.
export function createDisplayTexture() {
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

export function createCable(points: [number, number, number][], material: THREE.Material, radius = 0.028) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
  )
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 10), material)
}

export function createConnector(material: THREE.Material) {
  const group = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 16), material)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.07, 16), material)
  collar.position.y = 0.05
  group.add(body, collar)
  return group
}

export function createInverter() {
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

// Microinversor de 4 módulos, como nos datasheets (Hoymiles HMS-2250DW-4T e Growatt
// NEO 2250M-X2): corpo preto de 386 x 192 x 45,6 mm, suporte de fixação em cima, antena
// Wi-Fi, quatro pares de cabos CC com conectores e o cabo CA com conector próprio.
export function createMicroinverter() {
  const mm = 2 / 386
  const width = 386 * mm
  const height = 192 * mm
  const depth = 45.6 * mm

  const group = new THREE.Group()
  const housing = new THREE.MeshStandardMaterial({ color: 0x1a1d21, metalness: 0.35, roughness: 0.55 })
  const bracketMetal = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.6, roughness: 0.45 })
  const cableMaterial = new THREE.MeshStandardMaterial({ color: 0x0e1012, roughness: 0.6 })
  const screwMetal = new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.9, roughness: 0.35 })

  group.add(new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 4, 0.03), housing))

  // Tampa frontal levemente rebaixada, presa por parafusos nas bordas
  const lid = new THREE.Mesh(
    new RoundedBoxGeometry(width - 0.12, height - 0.12, 0.02, 3, 0.008),
    new THREE.MeshStandardMaterial({ color: 0x202429, metalness: 0.3, roughness: 0.6 })
  )
  lid.position.z = depth / 2
  group.add(lid)
  const screwGeometry = new THREE.CylinderGeometry(0.018, 0.018, 0.012, 12)
  const screwSpots = [-0.92, -0.46, 0, 0.46, 0.92].flatMap((x) => [
    [x, height / 2 - 0.03],
    [x, -height / 2 + 0.03],
  ])
  screwSpots.forEach(([x, y]) => {
    const screw = new THREE.Mesh(screwGeometry, screwMetal)
    screw.rotation.x = Math.PI / 2
    screw.position.set(x, y, depth / 2 + 0.002)
    group.add(screw)
  })

  // Suporte de fixação em chapa: recorte de alça no centro e dois rasgos nas pontas
  const bracketShape = new THREE.Shape()
  bracketShape.moveTo(-0.5, -0.3)
  bracketShape.lineTo(0.5, -0.3)
  bracketShape.lineTo(0.5, 0.32)
  bracketShape.quadraticCurveTo(0.5, 0.4, 0.42, 0.4)
  bracketShape.lineTo(-0.42, 0.4)
  bracketShape.quadraticCurveTo(-0.5, 0.4, -0.5, 0.32)
  bracketShape.closePath()
  const handle = new THREE.Path()
  handle.moveTo(-0.26, 0.1)
  handle.lineTo(0.26, 0.1)
  handle.lineTo(0.26, 0.28)
  handle.lineTo(-0.26, 0.28)
  handle.closePath()
  bracketShape.holes.push(handle)
  ;[-0.4, 0.37].forEach((x) => {
    const slot = new THREE.Path()
    slot.moveTo(x, 0.06)
    slot.lineTo(x + 0.03, 0.06)
    slot.lineTo(x + 0.03, 0.4)
    slot.lineTo(x, 0.4)
    slot.closePath()
    bracketShape.holes.push(slot)
  })
  const bracket = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bracketShape, { depth: 0.02, bevelEnabled: false }),
    bracketMetal
  )
  bracket.position.set(0, height / 2, -depth / 2 - 0.02)
  group.add(bracket)

  // Antena Wi-Fi saindo pela lateral esquerda
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.2, 16), housing)
  antenna.rotation.z = Math.PI / 2
  antenna.position.set(-width / 2 - 0.1, height * 0.3, 0)
  group.add(antenna)

  // Quatro pares de cabos CC (um par por módulo), dois de cada lado
  ;[-1, 1].forEach((side) => {
    ;[0.08, -0.08, -0.24, -0.38].forEach((y, i) => {
      const reach = i % 2 === 0 ? 0.48 : 0.3
      const startX = side * (width / 2)
      const endX = side * (width / 2 + reach)
      group.add(
        createCable(
          [
            [startX, y, 0],
            [startX + side * 0.12, y - 0.02, 0],
            [endX - side * 0.1, y - 0.05, 0],
            [endX, y - 0.05, 0],
          ],
          cableMaterial,
          0.018
        )
      )
      const connector = createConnector(cableMaterial)
      connector.scale.setScalar(0.7)
      connector.rotation.z = -side * (Math.PI / 2)
      connector.position.set(endX + side * 0.08, y - 0.05, 0)
      group.add(connector)
    })
  })

  // Cabo CA, mais grosso, com o conector de troncal
  group.add(
    createCable(
      [
        [width / 2, height * 0.32, 0],
        [width / 2 + 0.18, height * 0.32, 0],
        [width / 2 + 0.38, height * 0.3, 0],
      ],
      cableMaterial,
      0.03
    )
  )
  const acConnector = new THREE.Group()
  const acBody = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.3, 20), cableMaterial)
  const acCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.08, 20), cableMaterial)
  acCollar.position.y = -0.1
  acConnector.add(acBody, acCollar)
  acConnector.rotation.z = -Math.PI / 2
  acConnector.position.set(width / 2 + 0.52, height * 0.3, 0)
  group.add(acConnector)

  return group
}

