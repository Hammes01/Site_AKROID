import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projetos Realizados',
  description:
    'Confira instalações solares reais realizadas pela AKROID, com engenharia, potência instalada e resultados.',
}

export default async function ProjetosPublicPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, slug, city, state, power_installed_kwp, project_type')
    .eq('status', 'published')
    .order('installed_at', { ascending: false })

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">
        Projetos realizados
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Instalações reais, entregues com engenharia própria e acompanhamento
        de ponta a ponta.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {projects?.length ? (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/projetos/${project.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {project.project_type}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                {project.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {project.city}/{project.state} —{' '}
                {project.power_installed_kwp} kWp
              </p>
            </Link>
          ))
        ) : (
          <p className="text-slate-500">Nenhum projeto publicado no momento.</p>
        )}
      </div>
    </div>
  )
}