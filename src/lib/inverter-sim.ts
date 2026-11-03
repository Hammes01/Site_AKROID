// Simulação ilustrativa de inversor string x microinversor, usada na home.
// Os watts são de exemplo, para comparar os dois casos; não vêm de ficha técnica.

export type InverterMode = 'string' | 'micro'
export type PanelStatus = 'normal' | 'reduzida' | 'parada'
export type CableState = 'energia' | 'desligado' | 'perigo'

export type SimState = {
  mode: InverterMode
  shaded: number[]
  panelFault: boolean
  equipmentFault: boolean
  emergency: boolean
  rapidShutdown: boolean
}

export const PANEL_COUNT = 8
export const NORMAL_WATTS = 500
export const SHADED_WATTS = 150
// No string, a placa sombreada também puxa para baixo as outras da mesma série
export const STRING_PEER_WATTS = 400

// Fileira de cima: placas 0 a 3; de baixo: 4 a 7.
// String: uma série por fileira. Micro: um aparelho por bloco de 2 x 2 placas.
export const GROUPS: Record<InverterMode, number[][]> = {
  string: [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
  ],
  micro: [
    [0, 1, 4, 5],
    [2, 3, 6, 7],
  ],
}

// A falha de placa e a de equipamento acontecem sempre no primeiro grupo
export const FAULTY_PANEL = 1
const FAULTY_GROUP = 0

export const INITIAL_STATE: SimState = {
  mode: 'micro',
  shaded: [],
  panelFault: false,
  equipmentFault: false,
  emergency: false,
  rapidShutdown: false,
}

export function simulate(state: SimState) {
  const groups = GROUPS[state.mode]
  const isString = state.mode === 'string'
  const shaded = new Set(state.shaded)

  const panels = Array.from({ length: PANEL_COUNT }, (_, index) => {
    const groupIndex = groups.findIndex((group) => group.includes(index))
    const group = groups[groupIndex]

    const off =
      state.emergency ||
      (state.equipmentFault && (isString || groupIndex === FAULTY_GROUP)) ||
      (state.panelFault && (isString ? group.includes(FAULTY_PANEL) : index === FAULTY_PANEL))

    let watts = NORMAL_WATTS
    if (off) watts = 0
    else if (shaded.has(index)) watts = SHADED_WATTS
    else if (isString && group.some((other) => shaded.has(other))) watts = STRING_PEER_WATTS

    const status: PanelStatus = watts === 0 ? 'parada' : watts < NORMAL_WATTS ? 'reduzida' : 'normal'
    return {
      index,
      group: groupIndex,
      watts,
      status,
      shaded: shaded.has(index),
      failed: state.panelFault && index === FAULTY_PANEL,
    }
  })

  // Cabos CC de cada grupo: com sol, o string segue energizado na emergência,
  // a menos que tenha o desligamento rápido
  const dcDanger = state.emergency && isString && !state.rapidShutdown
  const dcCables: CableState[] = groups.map((_, groupIndex) => {
    if (dcDanger) return 'perigo'
    return panels.some((panel) => panel.group === groupIndex && panel.watts > 0) ? 'energia' : 'desligado'
  })
  const total = panels.reduce((sum, panel) => sum + panel.watts, 0)

  return {
    panels,
    total,
    dcCables,
    acCable: (total > 0 ? 'energia' : 'desligado') as CableState,
    equipmentDown: groups.map(
      (_, groupIndex) => state.emergency || (state.equipmentFault && (isString || groupIndex === FAULTY_GROUP))
    ),
    message: describe(state),
  }
}

function describe(state: SimState) {
  const isString = state.mode === 'string'
  if (state.emergency) {
    if (!isString) return 'Emergência: as placas desligam e os cabos ficam sem tensão.'
    return state.rapidShutdown
      ? 'Emergência: o desligamento rápido apaga os cabos CC. No string, isso exige dispositivo adicional.'
      : 'Emergência: o inversor para, mas os cabos CC seguem energizados enquanto houver sol.'
  }
  if (state.equipmentFault) {
    return isString
      ? 'Falha no inversor: todo o sistema para até o conserto.'
      : 'Falha num microinversor: só as 4 placas dele param; as outras 4 continuam.'
  }
  if (state.panelFault) {
    return isString
      ? 'Falha numa placa: a série dela inteira para de gerar.'
      : 'Falha numa placa: só ela para; as outras seguem normais.'
  }
  if (state.shaded.length > 0) {
    return isString
      ? 'Sombra: as placas da mesma série também perdem produção.'
      : 'Sombra: só a placa sombreada perde produção.'
  }
  return 'Toque numa placa para fazer sombra, ou teste uma falha.'
}

// Quiz: cada resposta é sim (true) ou não (false)
export type QuizAnswers = { shadeOrOrientations: boolean; largeNoObstacles: boolean }
export type QuizResult = 'micro' | 'string' | 'depende'

export function recommend({ shadeOrOrientations, largeNoObstacles }: QuizAnswers): QuizResult {
  if (shadeOrOrientations && !largeNoObstacles) return 'micro'
  if (!shadeOrOrientations && largeNoObstacles) return 'string'
  return 'depende'
}
