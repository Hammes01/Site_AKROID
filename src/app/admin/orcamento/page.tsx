'use client'

import { useState } from 'react'
import { calcSystem, DEFAULT_MIN_KWH, monthlyGenerationPerKwp } from '@/lib/solar-calc'

const inputClass =
  'w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-slate-500'

const FIELDS = [
  { name: 'consumption', label: 'Consumo médio (kWh/mês)', placeholder: 'Ex.: 1000' },
  { name: 'tariff', label: 'Tarifa (R$/kWh)', placeholder: 'Ex.: 1,19' },
  { name: 'sun', label: 'Sol (horas por dia)', placeholder: 'Ex.: 5,2' },
  { name: 'factor', label: 'Fator de desempenho', placeholder: 'Ex.: 0,8' },
  { name: 'panel', label: 'Potência da placa (W)', placeholder: 'Ex.: 715' },
  { name: 'price', label: 'Preço (R$/kWp)', placeholder: 'Ex.: 2600' },
  { name: 'minKwh', label: 'Taxa mínima (kWh)', placeholder: 'Mono 30, bi 50, tri 100' },
  { name: 'maintenance', label: 'Manutenção anual (R$)', placeholder: 'Vazio = sem manutenção' },
] as const

type FieldName = (typeof FIELDS)[number]['name']

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function decimal(value: number, digits = 2) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: digits })
}

export default function OrcamentoPage() {
  const [values, setValues] = useState<Partial<Record<FieldName, string>>>({
    factor: '0.8',
    minKwh: String(DEFAULT_MIN_KWH),
  })
  const num = (name: FieldName) => Number(values[name] ?? '') || 0

  const ready = num('consumption') && num('tariff') && num('sun') && num('factor') && num('price')
  const generation = monthlyGenerationPerKwp(num('sun'), num('factor'))
  const result = ready
    ? calcSystem({
        monthlyBill: num('consumption') * num('tariff'),
        tariff: num('tariff'),
        generationPerKwp: generation,
        pricePerKwp: num('price'),
        panelWatts: num('panel') || null,
        minKwh: values.minKwh ? num('minKwh') : DEFAULT_MIN_KWH,
        annualMaintenance: num('maintenance'),
      })
    : null

  const rows = result && [
    ['Geração por kWp', `${decimal(generation, 1)} kWh/mês`],
    ['kWp necessário', `${decimal(result.requiredKwp, 3)} kWp`],
    ...(result.panels ? [['Placas', String(result.panels)]] : []),
    ['kWp do sistema', `${decimal(result.systemKwp, 3)} kWp`],
    ['Geração do sistema', `${decimal(result.monthlyGeneration, 1)} kWh/mês`],
    ['Investimento', brl(result.investment)],
    ['Economia por mês', brl(result.monthlySavings)],
    ['Economia por ano', brl(result.yearlySavings)],
    ['Retorno', result.paybackYears === null ? '—' : `${decimal(result.paybackYears)} anos`],
  ]

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold">Calculadora de orçamento</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-400">
        Usa o mesmo cálculo do simulador do site e não salva nada. O resultado não inclui a
        cobrança do Fio B nem variações de tarifa e de preço dos equipamentos.
      </p>

      <div className="mt-6 grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="grid gap-4 self-start sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="mb-1 block text-sm text-slate-300">
                {field.label}
              </label>
              <input
                id={field.name}
                type="number"
                step="any"
                min="0"
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <div className="self-start rounded-lg border border-slate-800 p-6">
          {rows ? (
            <dl className="space-y-3 text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">
              Preencha consumo, tarifa, sol, fator e preço para ver o resultado.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
