import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function KitsPage() {
  const supabase = await createClient()

  const { data: kits } = await supabase
    .from('kits')
    .select('id, name, category, power_kwp, price, show_price, status, is_featured')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kits</h1>
        <Link
          href="/admin/kits/novo"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          + Novo kit
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Potência</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {kits?.length ? (
              kits.map((kit) => (
                <tr key={kit.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    {kit.name}
                    {kit.is_featured && (
                      <span className="ml-2 rounded-full bg-amber-900 px-2 py-0.5 text-xs text-amber-300">
                        Destaque
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 capitalize">
                    {kit.category ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {kit.power_kwp ? `${kit.power_kwp} kWp` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {kit.show_price
                      ? kit.price
                        ? `R$ ${Number(kit.price).toLocaleString('pt-BR')}`
                        : '—'
                      : 'Sob consulta'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        kit.status === 'published'
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {kit.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/kits/${kit.id}`}
                      className="text-slate-400 hover:text-white"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Nenhum kit cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}