import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Product {
  id: string
  name: string
  brand: string
  model: string
  status: string
  category_id: string | null
  product_categories: { name: string }[] | null
}

export default async function ProdutosPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, name, brand, model, status, category_id, product_categories(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          + Novo produto
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Marca / Modelo</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products?.length ? (
              products.map((product: Product) => (
                <tr key={product.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {product.brand} {product.model}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {product.product_categories?.[0]?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        product.status === 'published'
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/produtos/${product.id}`}
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
                  Nenhum produto cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}