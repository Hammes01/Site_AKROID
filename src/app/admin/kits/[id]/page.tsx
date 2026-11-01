import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KIT_INCLUDES } from '@/lib/kit-options'
import { addKitItem, deleteKit, removeKitItem, updateKit } from '../actions'
import KitImageUpload from './KitImageUpload'

export default async function EditarKitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: kit } = await supabase
    .from('kits')
    .select('*')
    .eq('id', id)
    .single()

  if (!kit) {
    notFound()
  }

  const [{ data: items }, { data: products }] = await Promise.all([
    supabase
      .from('kit_items')
      .select('id, quantity, products(name, brand, model)')
      .eq('kit_id', id)
      .order('created_at'),
    supabase.from('products').select('id, name, brand, model').order('name'),
  ])

  const addKitItemWithId = addKitItem.bind(null, id)
  const updateKitWithId = updateKit.bind(null, id)
  const deleteKitWithId = deleteKit.bind(null, id)

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar kit</h1>
        <form action={deleteKitWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
          >
            Excluir kit
          </button>
        </form>
      </div>

      <form action={updateKitWithId} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Nome *</label>
          <input
            name="name"
            required
            defaultValue={kit.name}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Potência (kWp)
            </label>
            <input
              name="power_kwp"
              type="number"
              step="0.01"
              defaultValue={kit.power_kwp ?? ''}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Categoria
            </label>
            <select
              name="category"
              defaultValue={kit.category ?? ''}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            >
              <option value="">Selecione...</option>
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Descrição</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={kit.description ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Preço (R$)
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={kit.price ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <fieldset>
          <legend className="mb-1 text-sm text-slate-300">O preço inclui</legend>
          <div className="flex flex-wrap gap-4">
            {KIT_INCLUDES.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  name="price_includes"
                  value={option.value}
                  defaultChecked={kit.price_includes?.includes(option.value)}
                  className="h-4 w-4"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="show_price"
            id="show_price"
            defaultChecked={kit.show_price}
            className="h-4 w-4"
          />
          <label htmlFor="show_price" className="text-sm text-slate-300">
            Exibir preço no site (se desmarcado, mostra &quot;Sob consulta&quot;)
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_featured"
            id="is_featured"
            defaultChecked={kit.is_featured}
            className="h-4 w-4"
          />
          <label htmlFor="is_featured" className="text-sm text-slate-300">
            Destacar este kit na home
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Status</label>
          <select
            name="status"
            defaultValue={kit.status}
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

      <section className="mt-10 max-w-xl border-t border-slate-800 pt-8">
        <h2 className="text-lg font-semibold">Itens do kit</h2>
        <p className="mt-1 text-sm text-slate-400">
          Só produtos publicados aparecem no site. Cadastre placa, inversor e estrutura em Produtos.
        </p>

        {items && items.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-800 rounded-lg border border-slate-800">
            {items.map((item) => {
              const product = (Array.isArray(item.products) ? item.products[0] : item.products) as {
                name: string
                brand: string | null
                model: string | null
              } | null

              return (
                <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span>
                    {item.quantity}x {[product?.name, product?.brand, product?.model].filter(Boolean).join(' · ')}
                  </span>
                  <form action={removeKitItem.bind(null, id, item.id)}>
                    <button type="submit" className="text-red-400 hover:text-red-300">
                      Remover
                    </button>
                  </form>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Nenhum item cadastrado.</p>
        )}

        <form action={addKitItemWithId} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="product_id" className="mb-1 block text-sm text-slate-300">
              Produto
            </label>
            <select
              id="product_id"
              name="product_id"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            >
              <option value="">Selecione...</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {[product.name, product.brand, product.model].filter(Boolean).join(' · ')}
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label htmlFor="quantity" className="mb-1 block text-sm text-slate-300">
              Qtd.
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue={1}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            Adicionar
          </button>
        </form>
      </section>

      <KitImageUpload kitId={id} kitName={kit.name} initialUrl={kit.main_image_url} />
    </div>
  )
}