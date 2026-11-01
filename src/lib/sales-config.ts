// Configurações comerciais editadas em /admin/configuracoes.
// Tudo aqui é público: não guarde nenhum dado sigiloso em sales_config.

import { DEFAULT_MIN_KWH } from './solar-calc'

export type RawSalesConfig = {
  whatsapp?: string
  region?: string
  cnpj?: string
  financing_text?: string
  trust_items?: string[]
  ga_id?: string
  meta_pixel_id?: string
  tariff?: number
  generation_per_kwp?: number
  price_per_kwp?: number
  savings_percent?: number
  panel_watts?: number
  min_kwh?: number
  annual_maintenance?: number
}

export type SimulatorConfig = {
  tariff: number
  generationPerKwp: number
  pricePerKwp: number
  savingsPercent: number | null
  panelWatts: number | null
  minKwh: number
  annualMaintenance: number
}

const GA_ID_PATTERN = /^G-[A-Z0-9]+$/
const META_PIXEL_PATTERN = /^\d+$/

export function isValidGaId(id: string) {
  return GA_ID_PATTERN.test(id)
}

export function isValidMetaPixelId(id: string) {
  return META_PIXEL_PATTERN.test(id)
}

function positive(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function parseSalesConfig(value: unknown) {
  const raw = (value ?? {}) as RawSalesConfig
  const tariff = positive(raw.tariff)
  const generationPerKwp = positive(raw.generation_per_kwp)
  const pricePerKwp = positive(raw.price_per_kwp)
  const gaId = text(raw.ga_id)
  const metaPixelId = text(raw.meta_pixel_id)

  return {
    whatsapp: text(raw.whatsapp),
    region: text(raw.region),
    cnpj: text(raw.cnpj),
    financingText: text(raw.financing_text),
    trustItems: Array.isArray(raw.trust_items)
      ? raw.trust_items.filter((item) => typeof item === 'string' && item.trim())
      : [],
    // Os IDs entram em um script, então só passam se tiverem o formato esperado
    gaId: gaId && isValidGaId(gaId) ? gaId : null,
    metaPixelId: metaPixelId && isValidMetaPixelId(metaPixelId) ? metaPixelId : null,
    // O simulador só existe com tarifa, geração e preço definidos pela empresa
    simulator:
      tariff && generationPerKwp && pricePerKwp
        ? ({
            tariff,
            generationPerKwp,
            pricePerKwp,
            savingsPercent: positive(raw.savings_percent),
            panelWatts: positive(raw.panel_watts),
            minKwh: positive(raw.min_kwh) ?? DEFAULT_MIN_KWH,
            annualMaintenance: positive(raw.annual_maintenance) ?? 0,
          } satisfies SimulatorConfig)
        : null,
  }
}

export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
