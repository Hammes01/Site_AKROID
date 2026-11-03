// Configurações comerciais editadas em /admin/configuracoes.
// Tudo aqui é público: não guarde nenhum dado sigiloso em sales_config.

import { DEFAULT_MIN_KWH } from './solar-calc'

export type RawSalesConfig = {
  whatsapp?: string
  region?: string
  cnpj?: string
  trust_items?: string[]
  about_text?: string
  about_photo_url?: string
  process_steps?: string[]
  cash_discount_percent?: number
  card_installments?: number
  contact_phone?: string
  contact_email?: string
  contact_address?: string
  ga_id?: string
  meta_pixel_id?: string
  tariff?: number
  generation_per_kwp?: number
  price_per_kwp?: number
  price_per_kwp_max?: number
  prices_updated_at?: string
  savings_percent?: number
  panel_watts?: number
  min_kwh?: number
  annual_maintenance?: number
}

export type SimulatorConfig = {
  tariff: number
  generationPerKwp: number
  // Sem preço, o simulador mostra só a economia e o investimento fica para a proposta
  pricePerKwp: number | null
  pricePerKwpMax: number | null
  savingsPercent: number | null
  panelWatts: number | null
  minKwh: number
  annualMaintenance: number
}

export type ProcessStep = { title: string; text: string }

export const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  {
    title: 'Primeiro contato',
    text: 'Você nos chama, ou nós chamamos você, e conversamos sobre o que você precisa.',
  },
  {
    title: 'Análise da conta de luz',
    text: 'Pedimos sua fatura para ver seu consumo e dimensionar o sistema.',
  },
  {
    title: 'Visita ao local',
    text: 'Vamos até você ver o telhado, a posição do sol e o padrão de entrada. Também é a hora de conversar pessoalmente e tirar dúvidas.',
  },
  {
    title: 'Proposta',
    text: 'Enviamos a cotação. Se você quiser financiar, com sua autorização simulamos nos bancos.',
  },
  {
    title: 'Projeto elétrico',
    text: 'Aceita a proposta, começamos o projeto na hora e damos entrada na aprovação junto à distribuidora.',
  },
  {
    title: 'Compra e pagamento',
    text: 'Fazemos a compra do material, com nota no seu nome ou da empresa, como você preferir. O pagamento pode ser à vista, no cartão ou financiado.',
  },
  {
    title: 'Instalação e vistoria',
    text: 'Com o material aqui e o projeto aprovado, instalamos, colocamos a sinalização exigida pelas normas e pedimos a vistoria. Depois dela, seu sistema entra em operação.',
  },
]

// Cada passo fica em uma linha, no formato "Título: texto"
export function formatProcessSteps(steps: ProcessStep[]) {
  return steps.map((step) => `${step.title}: ${step.text}`)
}

function parseProcessSteps(lines: unknown) {
  if (!Array.isArray(lines)) return DEFAULT_PROCESS_STEPS
  return lines
    .filter((line): line is string => typeof line === 'string' && !!line.trim())
    .map((line) => {
      const separator = line.indexOf(':')
      return separator === -1
        ? { title: line.trim(), text: '' }
        : { title: line.slice(0, separator).trim(), text: line.slice(separator + 1).trim() }
    })
}

// Item com [colchetes] ainda tem dado a preencher, então fica fora do site
const PLACEHOLDER_PATTERN = /\[[^\]]*\]/

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
    trustItems: Array.isArray(raw.trust_items)
      ? raw.trust_items.filter(
          (item) => typeof item === 'string' && item.trim() && !PLACEHOLDER_PATTERN.test(item)
        )
      : [],
    aboutText: text(raw.about_text),
    aboutPhotoUrl: text(raw.about_photo_url),
    processSteps: parseProcessSteps(raw.process_steps),
    cashDiscountPercent: positive(raw.cash_discount_percent),
    cardInstallments: positive(raw.card_installments),
    contactPhone: text(raw.contact_phone),
    contactEmail: text(raw.contact_email),
    contactAddress: text(raw.contact_address),
    // Os IDs entram em um script, então só passam se tiverem o formato esperado
    gaId: gaId && isValidGaId(gaId) ? gaId : null,
    metaPixelId: metaPixelId && isValidMetaPixelId(metaPixelId) ? metaPixelId : null,
    // O simulador só existe com tarifa e geração definidas pela empresa
    simulator:
      tariff && generationPerKwp
        ? ({
            tariff,
            generationPerKwp,
            pricePerKwp,
            pricePerKwpMax: pricePerKwp ? positive(raw.price_per_kwp_max) : null,            savingsPercent: positive(raw.savings_percent),
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
