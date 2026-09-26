import { createClient } from '@/lib/supabase/server'
import { createProduct } from '../actions'

export default async function NovoProdutoPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('product_categories')
    .select('id, name')
    .order('name')

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold">Novo produto</h1>

      <form action={createProduct} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Nome *</label>
          <input
            name="name"
            required
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Marca</label>
            <input
              name="brand"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Modelo</label>
            <input
              name="model"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Categoria</label>
          <select
            name="category_id"
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
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Garantia</label>
          <input
            name="warranty"
            placeholder="Ex: 25 anos"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Status</label>
          <select
            name="status"
            defaultValue="draft"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          Salvar produto
        </button>
      </form>
    </div>
  )
}