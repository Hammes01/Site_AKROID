import Link from 'next/link'
import { describeKitIncludes } from '@/lib/kit-options'
import type { SimulatorConfig } from '@/lib/sales-config'
import { maxMonthlyBillForSystem } from '@/lib/solar-calc'
import WhatsAppLink from './WhatsAppLink'

type Product = { name: string; brand: string | null; model: string | null }

export type HomeKit = {
  id: string
  name: string
  slug: string
  category: string | null
  description: string | null
  power_kwp: number | null
  price: number | null
  show_price: boolean
  main_image_url: string | null
  price_includes?: string[] | null
  kit_items?: { quantity: number; products: Product | Product[] | null }[]
}

const PAYMENT_ICONS = {
  cash: 'M3 7h18v10H3V7Zm9 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 10v.01M18 14v.01',
  card: 'M3 6h18v12H3V6Zm0 4h18M7 15h3',
  bank: 'M3 21h18M4 10h16L12 4 4 10Zm2 0v8m4-8v8m4-8v8m4-8v8',
  bndes: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
}

// Arredonda para baixo: "até R$ X" não pode prometer mais do que o sistema cobre
function formatMaxBill(value: number) {
  return (Math.floor(value / 10) * 10).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

function KitCard({
  kit,
  simulator,
  wide,
}: {
  kit: HomeKit
  simulator: SimulatorConfig | null
  wide: boolean
}) {
  const items = (kit.kit_items ?? [])
    .map((item) => ({
      quantity: item.quantity,
      product: Array.isArray(item.products) ? item.products[0] : item.products,
    }))
    .filter((item) => item.product)
  const priced = kit.show_price && kit.price
  const includes = priced ? describeKitIncludes(kit.price_includes) : null
  const maxBill =
    simulator && kit.power_kwp
      ? maxMonthlyBillForSystem(Number(kit.power_kwp), simulator)
      : null

  return (
    <article
      className={`grid overflow-hidden rounded-2xl border border-slate-200 bg-white ${
        wide && kit.main_image_url ? 'md:grid-cols-2' : ''
      }`}
    >
      {kit.main_image_url && (
        <div className={`overflow-hidden bg-slate-100 ${wide ? 'aspect-video md:aspect-auto md:min-h-80' : 'aspect-video'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={kit.main_image_url} alt={kit.name} loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-col p-6 md:p-8">
        {kit.category && <p className="text-sm font-medium text-brand-700 capitalize">{kit.category}</p>}
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Link href={`/kits/${kit.slug}`} className="hover:text-brand-700">
            {kit.name}
          </Link>
        </h3>
        {kit.description && <p className="mt-3 text-slate-600">{kit.description}</p>}

        {items.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-700">
            {items.map(({ quantity, product }) => (
              <li key={`${product!.name}-${product!.model}`} className="flex justify-between gap-4">
                <span>{[product!.name, product!.brand, product!.model].filter(Boolean).join(' · ')}</span>
                <span className="shrink-0 text-slate-500">{quantity}x</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-6">
          {maxBill && (
            <p className="text-sm font-medium text-brand-700">
              Ideal para contas de até {formatMaxBill(maxBill)}
            </p>
          )}
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {priced ? `A partir de R$ ${Number(kit.price).toLocaleString('pt-BR')}` : 'Sob consulta'}
          </p>
          {includes && <p className="mt-1 text-sm text-slate-500">{includes}</p>}
          <Link
            href={`/kits/${kit.slug}`}
            className="mt-5 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Ver detalhes do kit
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function KitsAndPayment({
  kits,
  simulator,
  whatsapp,
  cashDiscountPercent,
  cardInstallments,
}: {
  kits: HomeKit[]
  simulator: SimulatorConfig | null
  whatsapp: string | null
  cashDiscountPercent: number | null
  cardInstallments: number | null
}) {
  const methods = [
    {
      icon: PAYMENT_ICONS.cash,
      label: cashDiscountPercent ? `À vista com ${cashDiscountPercent}% de desconto` : 'À vista com desconto',
    },
    {
      icon: PAYMENT_ICONS.card,
      label: cardInstallments ? `Cartão de crédito em até ${cardInstallments}x` : 'Cartão de crédito',
    },
    { icon: PAYMENT_ICONS.bank, label: 'Financiamento bancário' },
    { icon: PAYMENT_ICONS.bndes, label: 'Financiamento pelo BNDES' },
  ]
  const PaymentHeading = kits.length > 0 ? 'h3' : 'h2'

  return (
    <section id="solucoes" className="scroll-mt-20 bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {kits.length > 0 && (
          <>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Kits em destaque
            </h2>
            <div className={`mt-10 grid grid-cols-1 gap-6 ${kits.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
              {kits.map((kit) => (
                <KitCard key={kit.id} kit={kit} simulator={simulator} wide={kits.length === 1} />
              ))}
            </div>
          </>
        )}

        <div className={kits.length > 0 ? 'mt-14' : ''}>
          <PaymentHeading className="text-2xl font-semibold tracking-tight text-slate-900">
            Formas de pagamento
          </PaymentHeading>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {methods.map((method) => (
              <li
                key={method.label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 font-medium text-slate-900"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 text-brand-600"
                >
                  <path d={method.icon} />
                </svg>
                {method.label}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-500">Financiamentos sujeitos à análise de crédito.</p>
            {whatsapp && (
              <WhatsAppLink
                number={whatsapp}
                message="Olá! Vim pelo site e quero saber sobre as formas de pagamento."
                className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-[#20bd5a]"
              >
                Falar pelo WhatsApp
              </WhatsAppLink>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
