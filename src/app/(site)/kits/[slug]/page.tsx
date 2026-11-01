import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface Product {
  name: string
  brand: string | null
  model: string | null
}

interface KitItem {
  quantity: number
  products: Product | Product[] | null
}

// O Supabase devolve um objeto em relações muitos-para-um, apesar da tipagem em lista
function getProduct(item: KitItem) {
  return Array.isArray(item.products) ? item.products[0] : item.products
}

interface Kit {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
  power_kwp: number
  price: number | null
  show_price: boolean
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: kit } = await supabase
    .from('kits')
    .select('name, description, power_kwp')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!kit) {
    return { title: 'Kit não encontrado' }
  }

  return {
    title: kit.name,
    description:
      kit.description ??
      `Kit solar de ${kit.power_kwp} kWp. Solicite um orçamento personalizado.`,
    openGraph: {
      title: kit.name,
      description: kit.description ?? undefined,
    },
  }
}

export default async function KitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: kit } = await supabase
    .from('kits')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!kit) {
    notFound()
  }

  const typedKit = kit as Kit

  const { data: items } = await supabase
    .from('kit_items')
    .select('quantity, products(name, brand, model)')
    .eq('kit_id', typedKit.id)

  const typedItems = items as KitItem[]

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {typedKit.category}
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">
        {typedKit.name}
      </h1>
      <p className="mt-2 text-slate-500">{typedKit.power_kwp} kWp</p>

      {typedKit.description && (
        <p className="mt-6 max-w-2xl text-slate-600">{typedKit.description}</p>
      )}

      {typedItems && typedItems.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">
            Composição do kit
          </h2>
          <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {typedItems.map((item: KitItem, i: number) => {
              const product = getProduct(item)
              return (
                <li key={i} className="flex justify-between px-4 py-3 text-sm">
                  <span>
                    {product?.name}
                    {product?.brand && ` — ${product.brand}`}
                    {product?.model && ` ${product.model}`}
                  </span>
                  <span className="text-slate-500">Qtd: {item.quantity}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-2xl font-semibold text-slate-900">
          {typedKit.show_price && typedKit.price
            ? `R$ ${Number(typedKit.price).toLocaleString('pt-BR')}`
            : 'Sob consulta'}
        </p>
        <Link
          href={`/contato?kit=${encodeURIComponent(typedKit.name)}`}
          className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
        >
          Solicitar orçamento
        </Link>
      </div>
    </div>
  )
}