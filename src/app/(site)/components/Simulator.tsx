'use client'

import Link from 'next/link'
import { useActionState, useRef, useState } from 'react'
import { PRIVACY_POLICY_PUBLISHED } from '@/lib/privacy'
import type { SimulatorConfig } from '@/lib/sales-config'
import { calcSystem, estimateRange } from '@/lib/solar-calc'
import { trackEvent, trackLead } from '@/lib/track'
import { submitLead } from '../contato/actions'

const initialState = { success: false, message: '' }
const MIN_BILL = 100
const MAX_BILL = 5000

function brl(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

// 22000 → "R$ 22 mil"
function thousands(value: number) {
  return `R$ ${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`
}

function years(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

function fromTo(min: number, max: number, format: (value: number) => string) {
  const [low, high] = [format(min), format(max)]
  return low === high ? low : `${low} a ${high}`
}

export default function Simulator({ config }: { config: SimulatorConfig }) {
  const [bill, setBill] = useState('500')
  const usedRef = useRef(false)
  const [state, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await submitLead(formData)
      if (result.success) trackLead('simulador')
      return result
    },
    initialState
  )

  const billValue = Number(bill)
  const result =
    billValue > 0
      ? calcSystem({ ...config, pricePerKwp: config.pricePerKwp ?? 0, monthlyBill: billValue })
      : null
  const range =
    result && config.pricePerKwp
      ? estimateRange({
          systemKwp: result.systemKwp,
          netYearlySavings: result.netYearlySavings,
          priceMin: config.pricePerKwp,
          priceMax: config.pricePerKwpMax,
        })
      : null
  const pricesDate = config.pricesUpdatedAt ? new Date(config.pricesUpdatedAt) : null

  function handleChange(value: string) {
    setBill(value)
    if (!usedRef.current) {
      usedRef.current = true
      trackEvent('simulator_used')
    }
  }

  return (
    <section id="simulador" className="scroll-mt-20 border-t border-slate-100 bg-white py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Quanto você pode economizar?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Informe o valor médio da sua conta de luz e veja uma estimativa na hora.
          </p>

          <label htmlFor="simulator-bill" className="mt-8 block text-sm font-medium text-slate-700">
            Conta de luz por mês (R$)
          </label>
          <input
            id="simulator-bill"
            type="number"
            min={1}
            inputMode="decimal"
            value={bill}
            onChange={(e) => handleChange(e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-2xl font-semibold text-slate-900 outline-none focus:border-brand-600"
          />
          <input
            type="range"
            aria-label="Ajustar valor da conta de luz"
            min={MIN_BILL}
            max={MAX_BILL}
            step={50}
            value={Math.min(MAX_BILL, Math.max(MIN_BILL, billValue || MIN_BILL))}
            onChange={(e) => handleChange(e.target.value)}
            className="mt-4 w-full accent-brand-600"
          />
        </div>

        <div className="rounded-2xl bg-slate-950 p-6 text-white md:p-10">
          {result ? (
            <>
              <p className="text-sm text-slate-300">Economia estimada por mês</p>
              <p className="mt-1 text-5xl font-semibold tracking-tight text-brand-300">
                {brl(result.monthlySavings)}
              </p>
              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                <div>
                  <dt className="text-xs text-slate-400">Economia por ano</dt>
                  <dd className="mt-1 text-lg font-semibold">{brl(result.yearlySavings)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Sistema estimado</dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {result.systemKwp.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kWp
                    {result.panels && config.panelWatts && (
                      <span className="block text-xs font-normal text-slate-300">
                        {result.panels} {result.panels === 1 ? 'placa' : 'placas'} de {config.panelWatts} W
                      </span>
                    )}
                  </dd>
                </div>
                {range ? (
                  <>
                    <div>
                      <dt className="text-xs text-slate-400">Investimento aproximado</dt>
                      <dd className="mt-1 text-lg font-semibold">
                        {fromTo(range.investmentMin, range.investmentMax, thousands)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Retorno estimado</dt>
                      <dd className="mt-1 text-lg font-semibold">
                        {range.paybackMin === null || range.paybackMax === null
                          ? '—'
                          : `${fromTo(range.paybackMin, range.paybackMax, years)} anos`}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <dt className="text-xs text-slate-400">Investimento</dt>
                    <dd className="mt-1 text-slate-200">
                      O valor sai na proposta, com os equipamentos do dia e o frete até o local da instalação.
                    </dd>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <p className="text-slate-300">Digite o valor da sua conta para ver a estimativa.</p>
          )}

          <p className="mt-6 text-xs text-slate-400">
            Estimativa, não é proposta.
            {range &&
              ' O investimento muda com a marca dos equipamentos, o preço do momento e o frete, que depende de onde você mora (cidade ou zona rural).'}
            {range &&
              pricesDate &&
              ` Preços de referência de ${pricesDate.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
                timeZone: 'America/Cuiaba',
              })}.`}
            {' '}O valor exato sai na proposta, depois da visita técnica.
            {!config.savingsPercent &&
              ' Este cálculo não inclui a cobrança do Fio B nem variações de tarifa.'}
          </p>

          {state.success ? (
            <p role="status" className="mt-6 rounded-lg bg-white/10 p-4 text-sm">
              {state.message}
            </p>
          ) : (
            <form action={formAction} className="mt-6 space-y-3 border-t border-white/10 pt-6">
              <p className="font-medium">Receba uma proposta com base neste valor</p>
              <input type="hidden" name="source" value="simulador" />
              <input type="hidden" name="monthly_bill" value={bill} />
              <input
                name="name"
                required
                aria-label="Nome"
                placeholder="Seu nome"
                className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 outline-none placeholder:text-slate-400 focus:border-brand-300"
              />
              <input
                name="whatsapp"
                required
                type="tel"
                aria-label="WhatsApp"
                placeholder="Seu WhatsApp com DDD"
                className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 outline-none placeholder:text-slate-400 focus:border-brand-300"
              />
              <input
                name="city"
                aria-label="Cidade"
                placeholder="Sua cidade"
                className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 outline-none placeholder:text-slate-400 focus:border-brand-300"
              />
              {PRIVACY_POLICY_PUBLISHED && (
            <label className="flex items-start gap-2 text-sm text-slate-300">
              <input type="checkbox" name="consent" required className="mt-1" />
              <span>
                Autorizo o uso dos meus dados para receber o orçamento. Veja a{' '}
                <Link href="/privacidade" className="underline">
                  política de privacidade
                </Link>
                .
              </span>
            </label>
          )}

          {state.message && <p className="text-sm text-red-300">{state.message}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-brand-500 py-3 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-50"
              >
                {pending ? 'Enviando...' : 'Quero minha proposta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
