import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateTestimonial, deleteTestimonial } from '../actions'

export default async function EditarDepoimentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: testimonial } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single()

  if (!testimonial) {
    notFound()
  }

  const updateWithId = updateTestimonial.bind(null, id)
  const deleteWithId = deleteTestimonial.bind(null, id)

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar depoimento</h1>
        <form action={deleteWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
          >
            Excluir depoimento
          </button>
        </form>
      </div>

      <form action={updateWithId} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Nome do cliente *
          </label>
          <input
            name="client_name"
            required
            defaultValue={testimonial.client_name}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Empresa</label>
            <input
              name="client_company"
              defaultValue={testimonial.client_company ?? ''}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Cidade</label>
            <input
              name="city"
              defaultValue={testimonial.city ?? ''}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Cargo</label>
          <input
            name="role"
            defaultValue={testimonial.role ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Depoimento (texto)
          </label>
          <textarea
            name="content"
            rows={4}
            defaultValue={testimonial.content ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            URL do vídeo (opcional)
          </label>
          <input
            name="video_url"
            type="url"
            defaultValue={testimonial.video_url ?? ''}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Nota (1 a 5)
          </label>
          <select
            name="rating"
            defaultValue={testimonial.rating ?? 5}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_published"
            id="is_published"
            defaultChecked={testimonial.is_published}
            className="h-4 w-4"
          />
          <label htmlFor="is_published" className="text-sm text-slate-300">
            Publicar no site
          </label>
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