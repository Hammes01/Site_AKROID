import { createPost } from '../actions'

export default function NovoPostPage() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold">Novo post</h1>

      <form action={createPost} className="mt-6 max-w-2xl space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Título *</label>
          <input
            name="title"
            required
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Resumo</label>
          <textarea
            name="excerpt"
            rows={2}
            placeholder="Aparece na listagem do blog, antes de abrir o post"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Conteúdo</label>
          <textarea
            name="content"
            rows={10}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Tags (separadas por vírgula)
          </label>
          <input
            name="tags"
            placeholder="energia solar, engenharia, inversor"
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
          Salvar post
        </button>
      </form>
    </div>
  )
}