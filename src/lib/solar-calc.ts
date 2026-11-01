// Cálculo do sistema solar, na mesma lógica do orçamento da empresa.
// Função pura e sem dependências: os valores vêm sempre de quem chama.

export const DEFAULT_MIN_KWH = 50

export type SolarInput = {
  monthlyBill: number
  tariff: number
  generationPerKwp: number
  pricePerKwp: number
  panelWatts?: number | null
  minKwh?: number
  annualMaintenance?: number
  // Quando preenchido, substitui a economia calculada (ajuste conservador)
  savingsPercent?: number | null
}

// Geração mensal de 1 kWp: sol × fator × 30. Ex.: 5,2 × 0,8 × 30 = 124,8
export function monthlyGenerationPerKwp(sunHours: number, performanceFactor: number) {
  return sunHours * performanceFactor * 30
}

// Maior conta que um sistema cobre, pela mesma conta de calcSystem: consumo = kWp × geração
export function maxMonthlyBillForSystem(
  systemKwp: number,
  { tariff, generationPerKwp }: Pick<SolarInput, 'tariff' | 'generationPerKwp'>
) {
  return systemKwp * generationPerKwp * tariff
}

export function calcSystem({
  monthlyBill,
  tariff,
  generationPerKwp,
  pricePerKwp,
  panelWatts = null,
  minKwh = DEFAULT_MIN_KWH,
  annualMaintenance = 0,
  savingsPercent = null,
}: SolarInput) {
  const consumptionKwh = monthlyBill / tariff
  const requiredKwp = consumptionKwh / generationPerKwp

  // Sempre arredonda para cima: para baixo, o sistema não cobriria o consumo.
  // O 1e-9 evita somar uma placa por erro de arredondamento do ponto flutuante.
  const panels = panelWatts ? Math.ceil(requiredKwp / (panelWatts / 1000) - 1e-9) : null
  const systemKwp = panels && panelWatts ? (panels * panelWatts) / 1000 : requiredKwp

  const monthlyGeneration = systemKwp * generationPerKwp
  const investment = systemKwp * pricePerKwp

  // A taxa mínima continua sendo cobrada, então esses kWh não viram economia
  const compensatedKwh = Math.min(monthlyGeneration, Math.max(consumptionKwh - minKwh, 0))
  const monthlySavings = savingsPercent
    ? monthlyBill * (savingsPercent / 100)
    : compensatedKwh * tariff
  const yearlySavings = monthlySavings * 12

  const netYearlySavings = yearlySavings - annualMaintenance
  const paybackYears = netYearlySavings > 0 ? investment / netYearlySavings : null

  return {
    consumptionKwh,
    requiredKwp,
    panels,
    systemKwp,
    monthlyGeneration,
    investment,
    monthlySavings,
    yearlySavings,
    paybackYears,
  }
}
