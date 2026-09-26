import { createKit } from '../actions'

export default function NovoKitPage() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold">Novo kit</h1>

      <form action={createKit} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Nome *</label>
          <input
            name="name"
            required
            placeholder="Ex: Kit Solar Residencial 8 kWp"
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
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Categoria
            </label>
            <select
              name="category"
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
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="show_price" id="show_price" className="h-4 w-4" />
          <label htmlFor="show_price" className="text-sm text-slate-300">
            Exibir preço no site (se desmarcado, mostra &quot;Sob consulta&quot;)
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_featured"
            id="is_featured"
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
          Salvar kit
        </button>
      </form>
    </div>
  )
}