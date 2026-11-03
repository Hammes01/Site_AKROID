'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  DEFAULT_PROCESS_STEPS,
  formatProcessSteps,
  isValidGaId,
  isValidMetaPixelId,
  type RawSalesConfig,
} from '@/lib/sales-config'
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

function toLines(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
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

    const tariff = toNumber(form.get('tariff'))
    const generationPerKwp = toNumber(form.get('generation_per_kwp'))
    if (!tariff !== !generationPerKwp) {
      return fail('Preencha tarifa e geração do simulador ou deixe as duas vazias.')
    }

    const priceMin = toNumber(form.get('price_per_kwp'))
    const priceMax = toNumber(form.get('price_per_kwp_max'))
    if (priceMax && !priceMin) return fail('Preencha o preço mínimo antes do máximo.')
    if (priceMin && priceMax && priceMax < priceMin) {
      return fail('O preço máximo não pode ser menor que o mínimo.')
    }
    // Data só para o admin saber quando os preços foram revistos
    const pricesChanged =
      priceMin !== initial?.price_per_kwp || priceMax !== initial?.price_per_kwp_max
    const pricesUpdatedAt = priceMin
      ? pricesChanged || !initial?.prices_updated_at
        ? new Date().toISOString()
        : initial.prices_updated_at
      : undefined

    const savingsPercent = toNumber(form.get('savings_percent'))
    if ((savingsPercent ?? 0) > 100) return fail('A economia não pode passar de 100%.')

    setSaving(true)
    let aboutPhotoUrl = form.get('remove_about_photo') === 'on' ? undefined : initial?.about_photo_url
    const photo = form.get('about_photo') as File | null
    if (photo && photo.size > 0) {
      const extension = PHOTO_EXTENSIONS[photo.type]
      if (!extension || photo.size > 10 * 1024 * 1024) {
        setSaving(false)
        return fail('A foto precisa ser JPG, PNG ou WebP de até 10 MB.')
      }
      const supabase = createClient()
      const path = `about-photo-${Date.now()}.${extension}`
      const { error: uploadError } = await supabase.storage.from('site-assets').upload(path, photo)
      if (uploadError) {
        setSaving(false)
        return fail(uploadError.message)
      }
      aboutPhotoUrl = supabase.storage.from('site-assets').getPublicUrl(path).data.publicUrl
    }

    const value: RawSalesConfig = {
      whatsapp,
      region: toText(form.get('region')),
      cnpj: toText(form.get('cnpj')),
      contact_phone: toText(form.get('contact_phone')),
      contact_email: toText(form.get('contact_email')),
      contact_address: toText(form.get('contact_address')),
      trust_items: toLines(form.get('trust_items')),
      about_text: toText(form.get('about_text')),
      about_photo_url: aboutPhotoUrl,
      process_steps: toLines(form.get('process_steps')),
      cash_discount_percent: toNumber(form.get('cash_discount_percent')),
      card_installments: toNumber(form.get('card_installments')),
      ga_id: gaId,
      meta_pixel_id: metaPixelId,
      tariff,
      generation_per_kwp: generationPerKwp,
      price_per_kwp: priceMin,
      price_per_kwp_max: priceMax,
      prices_updated_at: pricesUpdatedAt,
      savings_percent: savingsPercent,
      panel_watts: toNumber(form.get('panel_watts')),
      min_kwh: toNumber(form.get('min_kwh')),
      annual_maintenance: toNumber(form.get('annual_maintenance')),
    }

    const { error } = await createClient()
      .from('site_settings')
      .upsert({ key: 'sales_config', value, updated_at: new Date().toISOString() })

    if (error) {
      setSaving(false)
      return fail(error.message)
    }

    await revalidateHome()
    setInitial(value)
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
        <div>
          <label htmlFor="contact_phone" className="mb-1 block text-sm text-slate-300">Telefone (rodapé)</label>
          <input id="contact_phone" name="contact_phone" defaultValue={initial.contact_phone} className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact_email" className="mb-1 block text-sm text-slate-300">E-mail (rodapé)</label>
          <input id="contact_email" name="contact_email" type="email" defaultValue={initial.contact_email} className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact_address" className="mb-1 block text-sm text-slate-300">Endereço (rodapé)</label>
          <input id="contact_address" name="contact_address" defaultValue={initial.contact_address} className={inputClass} />
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
          placeholder={'Só informações verdadeiras. Ex.:\nTécnico em eletrotécnica com registro profissional nº [número]\nEmpresa familiar: atendimento direto com os donos\nGarantia de instalação de [X] anos'}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500">Linha com [colchetes] fica escondida no site até você trocar pelo dado real.</p>
      </div>

      <div>
        <label htmlFor="about_text" className="mb-1 block text-sm text-slate-300">História da empresa</label>
        <textarea id="about_text" name="about_text" rows={4} defaultValue={initial.about_text} className={inputClass} />
      </div>

      <div>
        <label htmlFor="about_photo" className="mb-1 block text-sm text-slate-300">Foto de quem cuida do projeto</label>
        {initial.about_photo_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={initial.about_photo_url} alt="" className="mb-2 aspect-video w-full rounded-md object-cover" />
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" name="remove_about_photo" className="h-4 w-4" />
              Remover esta foto
            </label>
          </>
        )}
        <input
          id="about_photo"
          name="about_photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:text-white"
        />
      </div>

      <div>
        <label htmlFor="process_steps" className="mb-1 block text-sm text-slate-300">
          Como funciona (um passo por linha, no formato Título: texto)
        </label>
        <textarea
          id="process_steps"
          name="process_steps"
          rows={10}
          defaultValue={(initial.process_steps ?? formatProcessSteps(DEFAULT_PROCESS_STEPS)).join('\n')}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500">Não coloque prazos que vocês não possam garantir.</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-300">Formas de pagamento</legend>
        <p className="text-xs text-slate-500">Vazio mostra o texto sem números.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="cash_discount_percent" className="mb-1 block text-sm text-slate-300">Desconto à vista (%)</label>
            <input id="cash_discount_percent" name="cash_discount_percent" type="number" step="any" min="0" max="100" defaultValue={initial.cash_discount_percent} className={inputClass} />
          </div>
          <div>
            <label htmlFor="card_installments" className="mb-1 block text-sm text-slate-300">Parcelas no cartão</label>
            <input id="card_installments" name="card_installments" type="number" step="1" min="1" defaultValue={initial.card_installments} className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-300">Simulador de economia</legend>
        <p className="text-xs text-slate-500">
          Só aparece com tarifa e geração preenchidas. Os exemplos não são recomendações: use os valores reais de vocês.
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
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm text-slate-300">Preço instalado (R$/kWp), opcional</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="price_per_kwp" className="mb-1 block text-xs text-slate-400">Mínimo: equipamento mais em conta, frete urbano</label>
                <input id="price_per_kwp" name="price_per_kwp" type="number" step="any" min="0" defaultValue={initial.price_per_kwp} placeholder="Ex.: 2600" className={inputClass} />
              </div>
              <div>
                <label htmlFor="price_per_kwp_max" className="mb-1 block text-xs text-slate-400">Máximo: equipamento mais caro, frete rural</label>
                <input id="price_per_kwp_max" name="price_per_kwp_max" type="number" step="any" min="0" defaultValue={initial.price_per_kwp_max} placeholder="Ex.: 3200" className={inputClass} />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              O site mostra uma faixa arredondada em milhares (ex.: R$ 22 mil a R$ 28 mil).
              Vazio esconde o investimento e o retorno: o visitante vê só a economia.
              {initial.prices_updated_at &&
                ` Atualizados em ${new Date(initial.prices_updated_at).toLocaleDateString('pt-BR')}.`}
            </p>
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
