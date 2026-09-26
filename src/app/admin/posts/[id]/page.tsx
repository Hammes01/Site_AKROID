import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updatePost, deletePost } from '../actions'

export default async function EditarPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  const updateWithId = updatePost.bind(null, id)
  const deleteWithId = deletePost.bind(null, id)

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar post</h1>
        <form action={deleteWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
          >
            Excluir post
          </button>
        </form>
      </div>

      <form action={updateWithId} className="mt-6 max-w-2xl space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Título *</label>
          <input
            name="title"
            required
            defaultValue={post.title}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Resumo</label>
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={post.excerpt ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Conteúdo</label>
          <textarea
            name="content"
            rows={10}
            defaultValue={post.content ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Tags (separadas por vírgula)
          </label>
          <input
            name="tags"
            defaultValue={(post.tags ?? []).join(', ')}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Status</label>
          <select
            name="status"
            defaultValue={post.status}
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