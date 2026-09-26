import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProduct, deleteProduct } from '../actions'

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  const { data: categories } = await supabase
    .from('product_categories')
    .select('id, name')
    .order('name')

  const updateProductWithId = updateProduct.bind(null, id)
  const deleteProductWithId = deleteProduct.bind(null, id)

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar produto</h1>
        <form action={deleteProductWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
          >
            Excluir produto
          </button>
        </form>
      </div>

      <form action={updateProductWithId} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Nome *</label>
          <input
            name="name"
            required
            defaultValue={product.name}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Marca</label>
            <input
              name="brand"
              defaultValue={product.brand ?? ''}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Modelo</label>
            <input
              name="model"
              defaultValue={product.model ?? ''}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Categoria</label>
          <select
            name="category_id"
            defaultValue={product.category_id ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          >
            <option value="">Selecione...</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Descrição</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={product.description ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Garantia</label>
          <input
            name="warranty"
            defaultValue={product.warranty ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Status</label>
          <select
            name="status"
            defaultValue={product.status}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          Salvar alterações
        </button>
      </form>
    </div>
  )
}