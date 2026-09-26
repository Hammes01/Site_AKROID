import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('title, description, city, state, power_installed_kwp')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!project) {
    return { title: 'Projeto não encontrado' }
  }

  return {
    title: project.title,
    description:
      project.description ??
      `Instalação de ${project.power_installed_kwp} kWp em ${project.city}/${project.state}.`,
    openGraph: {
      title: project.title,
      description: project.description ?? undefined,
    },
  }
}

export default async function ProjetoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!project) {
    notFound()
  }

  const { data: media } = await supabase
    .from('project_media')
    .select('url, phase, sort_order')
    .eq('project_id', project.id)
    .order('sort_order', { ascending: true })

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {project.project_type}
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">
        {project.title}
      </h1>
      <p className="mt-2 text-slate-500">
        {project.city}/{project.state} — {project.power_installed_kwp} kWp
      </p>

      {project.description && (
        <p className="mt-6 max-w-2xl text-slate-600">{project.description}</p>
      )}

      <dl className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm md:grid-cols-3">
        {project.module_count && (
          <div>
            <dt className="text-slate-400">Módulos</dt>
            <dd className="font-medium text-slate-900">
              {project.module_count}
            </dd>
          </div>
        )}
        {project.inverter_brand && (
          <div>
            <dt className="text-slate-400">Inversor</dt>
            <dd className="font-medium text-slate-900">
              {project.inverter_brand}
            </dd>
          </div>
        )}
        {project.power_installed_kwp && (
          <div>
            <dt className="text-slate-400">Potência instalada</dt>
            <dd className="font-medium text-slate-900">
              {project.power_installed_kwp} kWp
            </dd>
          </div>
        )}
      </dl>

      {project.video_url && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Vídeo</h2>
          <div className="aspect-video overflow-hidden rounded-xl border border-slate-200">
            <iframe
              src={project.video_url}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {media && media.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Galeria</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {media.map((item, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={item.url}
                alt={`${project.title} — ${item.phase ?? ''}`}
                className="aspect-square rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}