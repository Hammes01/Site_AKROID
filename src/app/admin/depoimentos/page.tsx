import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DepoimentosPage() {
  const supabase = await createClient()

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('id, client_name, city, rating, is_published')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Depoimentos</h1>
        <Link
          href="/admin/depoimentos/novo"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          + Novo depoimento
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {testimonials?.length ? (
              testimonials.map((t) => (
                <tr key={t.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{t.client_name}</td>
                  <td className="px-4 py-3 text-slate-400">{t.city ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {t.rating ? '⭐'.repeat(t.rating) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        t.is_published
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.is_published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/depoimentos/${t.id}`}
                      className="text-slate-400 hover:text-white"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Nenhum depoimento cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}