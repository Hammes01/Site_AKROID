import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateKit, deleteKit } from '../actions'

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
    </div>
  )
}