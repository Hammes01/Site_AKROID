'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isValidGaId, isValidMetaPixelId, type RawSalesConfig } from '@/lib/sales-config'
import { revalidateHome } from './actions'

const inputClass =
  'w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-slate-500'

function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  return digits.startsWith('55') && (digits.length === 12 || digits.length === 13) ? digits : null
}

function toNumber(value: FormDataEntryValue | null) {
  const number = Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(number) && number > 0 ? number : undefined
}

function toText(value: FormDataEntryValue | null) {
  return String(value ?? '').trim() || undefined
}

export default function SalesSettings() {
  const [initial, setInitial] = useState<RawSalesConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null)

  useEffect(() => {
    createClient()
      .from('site_settings')
      .select('value')
      .eq('key', 'sales_config')
      .maybeSingle()
      .then(({ data }) => setInitial((data?.value as RawSalesConfig | null) ?? {}))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    const form = new FormData(e.currentTarget)
    const fail = (text: string) => setMessage({ text, success: false })

    const whatsappInput = toText(form.get('whatsapp'))
    const whatsapp = whatsappInput ? normalizeWhatsapp(whatsappInput) : undefined
    if (whatsapp === null) return fail('WhatsApp inválido. Use DDD + número, ex.: (66) 99999-9999.')

    const gaId = toText(form.get('ga_id'))
    if (gaId && !isValidGaId(gaId)) return fail('O ID do Google Analytics deve ser como G-ABC123.')

    const metaPixelId = toText(form.get('meta_pixel_id'))
    if (metaPixelId && !isValidMetaPixelId(metaPixelId)) {
      return fail('O ID do Pixel da Meta deve ter só números.')
    }

    const simulator = {
      tariff: toNumber(form.get('tariff')),
      generation_per_kwp: toNumber(form.get('generation_per_kwp')),
      price_per_kwp: toNumber(form.get('price_per_kwp')),
    }
    const filled = Object.values(simulator).filter(Boolean).length
    if (filled > 0 && filled < 3) {
      return fail('Preencha tarifa, geração e preço do simulador ou deixe os três vazios.')
    }

    const savingsPercent = toNumber(form.get('savings_percent'))
    if ((savingsPercent ?? 0) > 100) return fail('A economia não pode passar de 100%.')

    const value: RawSalesConfig = {
      whatsapp,
      region: toText(form.get('region')),
      cnpj: toText(form.get('cnpj')),
      financing_text: toText(form.get('financing_text')),
      trust_items: String(form.get('trust_items') ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      ga_id: gaId,
      meta_pixel_id: metaPixelId,
      ...simulator,
      savings_percent: savingsPercent,
      panel_watts: toNumber(form.get('panel_watts')),
      min_kwh: toNumber(form.get('min_kwh')),
      annual_maintenance: toNumber(form.get('annual_maintenance')),
    }

    setSaving(true)
    const { error } = await createClient()
      .from('site_settings')
      .upsert({ key: 'sales_config', value, updated_at: new Date().toISOString() })

    if (error) {
      setSaving(false)
      return fail(error.message)
    }

    await revalidateHome()
    setSaving(false)
    setMessage({ text: 'Configurações salvas!', success: true })
  }

  if (!initial) return <p className="mt-6 text-sm text-slate-500">Carregando...</p>

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-6 rounded-lg border border-slate-800 p-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-300">Vendas e confiança</h2>
        <p className="mt-1 text-xs text-slate-500">
          Campo vazio esconde o recurso no site. Tudo aqui fica público.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="whatsapp" className="mb-1 block text-sm text-slate-300">WhatsApp de vendas</label>
          <input id="whatsapp" name="whatsapp" defaultValue={initial.whatsapp} placeholder="(66) 99999-9999" className={inputClass} />
        </div>
        <div>
          <label htmlFor="region" className="mb-1 block text-sm text-slate-300">Região de atendimento</label>
          <input id="region" name="region" defaultValue={initial.region} placeholder="Ex.: Mato Grosso" className={inputClass} />
        </div>
        <div>
          <label htmlFor="cnpj" className="mb-1 block text-sm text-slate-300">CNPJ</label>
          <input id="cnpj" name="cnpj" defaultValue={initial.cnpj} placeholder="00.000.000/0001-00" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="trust_items" className="mb-1 block text-sm text-slate-300">
          Provas de confiança (uma por linha)
        </label>
        <textarea
          id="trust_items"
          name="trust_items"
          rows={4}
          defaultValue={initial.trust_items?.join('\n')}
          placeholder={'Só informações verdadeiras. Ex.:\nEngenheiro responsável com registro no CREA\nGarantia de instalação de X anos'}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="financing_text" className="mb-1 block text-sm text-slate-300">
          Formas de pagamento e financiamento
        </label>
        <textarea
          id="financing_text"
          name="financing_text"
          rows={3}
          defaultValue={initial.financing_text}
          placeholder="Descreva as condições que vocês realmente oferecem."
          className={inputClass}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-300">Simulador de economia</legend>
        <p className="text-xs text-slate-500">
          Só aparece com tarifa, geração e preço preenchidos. Os exemplos não são recomendações: use os valores reais de vocês.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="tariff" className="mb-1 block text-sm text-slate-300">Tarifa de energia (R$/kWh)</label>
            <input id="tariff" name="tariff" type="number" step="any" min="0" defaultValue={initial.tariff} placeholder="Ex.: 1,00" className={inputClass} />
          </div>
          <div>
            <label htmlFor="generation_per_kwp" className="mb-1 block text-sm text-slate-300">Geração (kWh por kWp ao mês)</label>
            <input id="generation_per_kwp" name="generation_per_kwp" type="number" step="any" min="0" defaultValue={initial.generation_per_kwp} placeholder="Ex.: 124,8" className={inputClass} />
            <p className="mt-1 text-xs text-slate-500">Sol × fator × 30. Ex.: 5,2 × 0,8 × 30 = 124,8</p>
          </div>
          <div>
            <label htmlFor="price_per_kwp" className="mb-1 block text-sm text-slate-300">Preço médio instalado (R$/kWp)</label>
            <input id="price_per_kwp" name="price_per_kwp" type="number" step="any" min="0" defaultValue={initial.price_per_kwp} placeholder="Ex.: 3500" className={inputClass} />
          </div>
          <div>
            <label htmlFor="savings_percent" className="mb-1 block text-sm text-slate-300">Ajuste de economia na conta (%), opcional</label>
            <input id="savings_percent" name="savings_percent" type="number" step="any" min="0" max="100" defaultValue={initial.savings_percent} placeholder="Vazio = calcula pela taxa mínima" className={inputClass} />
            <p className="mt-1 text-xs text-slate-500">Se preenchido, substitui o cálculo. Use para reduzir a economia por causa do Fio B.</p>
          </div>
          <div>
            <label htmlFor="panel_watts" className="mb-1 block text-sm text-slate-300">Potência da placa (W), opcional</label>
            <input id="panel_watts" name="panel_watts" type="number" step="any" min="0" defaultValue={initial.panel_watts} placeholder="Ex.: 715" className={inputClass} />
          </div>
          <div>
            <label htmlFor="min_kwh" className="mb-1 block text-sm text-slate-300">Taxa mínima (kWh), opcional</label>
            <input id="min_kwh" name="min_kwh" type="number" step="any" min="1" defaultValue={initial.min_kwh} placeholder="Vazio = 50" className={inputClass} />
            <p className="mt-1 text-xs text-slate-500">Monofásico 30, bifásico 50, trifásico 100.</p>
          </div>
          <div>
            <label htmlFor="annual_maintenance" className="mb-1 block text-sm text-slate-300">Manutenção anual (R$), opcional</label>
            <input id="annual_maintenance" name="annual_maintenance" type="number" step="any" min="0" defaultValue={initial.annual_maintenance} placeholder="Vazio = 0" className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-300">Medição</legend>
        <p className="text-xs text-slate-500">
          Só carregam depois que o visitante aceita o aviso de cookies.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="ga_id" className="mb-1 block text-sm text-slate-300">ID do Google Analytics</label>
            <input id="ga_id" name="ga_id" defaultValue={initial.ga_id} placeholder="G-XXXXXXXXXX" className={inputClass} />
          </div>
          <div>
            <label htmlFor="meta_pixel_id" className="mb-1 block text-sm text-slate-300">ID do Pixel da Meta</label>
            <input id="meta_pixel_id" name="meta_pixel_id" defaultValue={initial.meta_pixel_id} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {message && (
        <p className={`text-sm ${message.success ? 'text-emerald-400' : 'text-red-400'}`}>{message.text}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50"
      >
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </form>
  )
}
