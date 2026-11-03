import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  calcSystem,
  estimateRange,
  maxMonthlyBillForSystem,
  monthlyGenerationPerKwp,
} from './solar-calc.ts'

const base = {
  generationPerKwp: 124.8,
  pricePerKwp: 2600,
  panelWatts: 715,
  minKwh: 50,
}

function near(actual: number | null, expected: number, tolerance = 0.01) {
  assert.ok(actual !== null, 'valor não deveria ser nulo')
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `esperado ${expected}, recebido ${actual}`
  )
}

describe('calcSystem: casos do orçamento', () => {
  const cases = [
    { kwh: 1000, tariff: 1.19, required: 8.013, panels: 12, kwp: 8.58, gen: 1070.8, inv: 22308, month: 1130.5, back: 1.64 },
    { kwh: 500, tariff: 1.19, required: 4.006, panels: 6, kwp: 4.29, gen: 535.4, inv: 11154, month: 535.5, back: 1.74 },
    { kwh: 344, tariff: 1.19, required: 2.756, panels: 4, kwp: 2.86, gen: 356.9, inv: 7436, month: 349.86, back: 1.77 },
    { kwh: 900, tariff: 1.13, required: 7.212, panels: 11, kwp: 7.865, gen: 981.6, inv: 20449, month: 960.5, back: 1.77 },
  ]

  for (const c of cases) {
    it(`${c.kwh} kWh a R$ ${c.tariff}`, () => {
      const result = calcSystem({ ...base, tariff: c.tariff, monthlyBill: c.kwh * c.tariff })
      near(result.consumptionKwh, c.kwh)
      near(result.requiredKwp, c.required, 0.001)
      assert.equal(result.panels, c.panels)
      near(result.systemKwp, c.kwp, 0.001)
      near(result.monthlyGeneration, c.gen, 0.1)
      near(result.investment, c.inv, 1)
      near(result.monthlySavings, c.month)
      near(result.yearlySavings, c.month * 12)
      near(result.paybackYears, c.back)
    })
  }
})

describe('maxMonthlyBillForSystem', () => {
  const config = { tariff: 1.19, generationPerKwp: 124.8 }

  it('calcula a conta máxima de um kit de 8 kWp', () => {
    near(maxMonthlyBillForSystem(8, config), 1188.1, 0.1)
  })

  it('é coerente com o simulador: essa conta precisa exatamente daquele sistema', () => {
    const bill = maxMonthlyBillForSystem(8, config)
    near(calcSystem({ ...base, ...config, panelWatts: null, monthlyBill: bill }).requiredKwp, 8, 0.0001)
  })
})

describe('calcSystem: regras', () => {
  const bill1000 = { ...base, tariff: 1.19, monthlyBill: 1190 }

  it('desconta a manutenção anual do retorno', () => {
    near(calcSystem({ ...bill1000, annualMaintenance: 500 }).paybackYears, 1.71)
  })

  it('fator 0,9 da planilha: geração 140,4 dá 6,41 kWp (célula AI61)', () => {
    const result = calcSystem({
      ...base,
      generationPerKwp: 140.4,
      tariff: 1.13,
      monthlyBill: 900 * 1.13,
    })
    near(result.requiredKwp, 6.41)
    assert.equal(result.panels, 9)
    near(result.systemKwp, 6.435, 0.001)
  })

  it('monta a geração a partir do sol e do fator', () => {
    near(monthlyGenerationPerKwp(5.2, 0.8), 124.8, 0.001)
    near(monthlyGenerationPerKwp(5.2, 0.9), 140.4, 0.001)
  })

  it('savingsPercent substitui a economia calculada', () => {
    const result = calcSystem({ ...bill1000, savingsPercent: 70 })
    near(result.monthlySavings, 833)
    near(result.paybackYears, 22308 / (833 * 12))
  })

  it('usa 50 kWh como taxa mínima padrão e respeita outro valor', () => {
    near(calcSystem({ ...bill1000, minKwh: undefined }).monthlySavings, 1130.5)
    near(calcSystem({ ...bill1000, minKwh: 100 }).monthlySavings, 900 * 1.19)
  })

  it('sem potência da placa, não arredonda e devolve placas nulas', () => {
    const result = calcSystem({ ...bill1000, panelWatts: null })
    assert.equal(result.panels, null)
    near(result.systemKwp, 8.013, 0.001)
  })

  it('não soma placa extra quando o kWp já é múltiplo exato da placa', () => {
    const result = calcSystem({
      ...base,
      generationPerKwp: 100,
      tariff: 1,
      monthlyBill: 715 * 10,
    })
    assert.equal(result.panels, 100)
  })

  it('não mostra retorno quando a economia não cobre a manutenção', () => {
    assert.equal(calcSystem({ ...bill1000, annualMaintenance: 20000 }).paybackYears, null)
  })

  it('faixa usa preço mínimo e máximo e arredonda para fora em milhares', () => {
    const { systemKwp, netYearlySavings } = calcSystem(bill1000)
    const range = estimateRange({ systemKwp, netYearlySavings, priceMin: 2600, priceMax: 3200 })
    assert.equal(range.investmentMin, 22000)
    assert.equal(range.investmentMax, 28000)
    near(range.paybackMin, 22000 / netYearlySavings)
    near(range.paybackMax, 28000 / netYearlySavings)
  })

  it('faixa com um preço só fica no milhar de cima e de baixo', () => {
    const { systemKwp, netYearlySavings } = calcSystem(bill1000)
    const range = estimateRange({ systemKwp, netYearlySavings, priceMin: 2600 })
    assert.equal(range.investmentMin, 22000)
    assert.equal(range.investmentMax, 23000)
  })

  it('faixa ignora máximo menor que o mínimo e não mostra retorno sem economia', () => {
    const range = estimateRange({ systemKwp: 10, netYearlySavings: 0, priceMin: 3000, priceMax: 2000 })
    assert.equal(range.investmentMax, 30000)
    assert.equal(range.paybackMin, null)
  })

  it('não mostra retorno quando o consumo não passa da taxa mínima', () => {
    const result = calcSystem({ ...base, tariff: 1, monthlyBill: 40 })
    assert.equal(result.monthlySavings, 0)
    assert.equal(result.paybackYears, null)
  })
})
