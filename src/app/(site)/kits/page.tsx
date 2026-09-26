import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kits Solares',
  description:
    'Kits solares residenciais, comerciais e industriais, com equipamentos selecionados e engenharia própria.',
}

export default async function KitsPublicPage() {
  const supabase = await createClient()

  const { data: kits } = await supabase
    .from('kits')
    .select('id, name, slug, power_kwp, category, price, show_price, description')
    .eq('status', 'published')
    .order('power_kwp', { ascending: true })

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">
        Kits solares
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Sistemas completos, dimensionados para diferentes perfis de consumo.
        Não encontrou o ideal? Fale com a gente para um projeto sob medida.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {kits?.length ? (
          kits.map((kit) => (
            <Link
              key={kit.id}
              href={`/kits/${kit.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {kit.category}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                {kit.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{kit.power_kwp} kWp</p>
              {kit.description && (
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                  {kit.description}
                </p>
              )}
              <p className="mt-4 text-sm font-medium text-slate-900">
                {kit.show_price && kit.price
                  ? `A partir de R$ ${Number(kit.price).toLocaleString('pt-BR')}`
                  : 'Sob consulta'}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-slate-500">Nenhum kit publicado no momento.</p>
        )}
      </div>
    </div>
  )
}