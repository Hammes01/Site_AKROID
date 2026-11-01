import Link from 'next/link'

type ProjectCase = {
  id: string
  title: string
  slug: string
  city: string | null
  state: string | null
  power_installed_kwp: number | null
  project_type: string | null
  module_count: number | null
  inverter_brand: string | null
  description: string | null
  project_media: { url: string; phase: string | null; sort_order: number | null }[]
}

// Prefere a foto do resultado final; se não houver, usa a primeira da galeria.
function getCover(media: ProjectCase['project_media']) {
  const sorted = [...media].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  return (sorted.find((item) => item.phase === 'depois') ?? sorted[0])?.url
}

function CaseCard({ project, featured }: { project: ProjectCase; featured: boolean }) {
  const cover = getCover(project.project_media)
  const location = [project.city, project.state].filter(Boolean).join('/')
  const stats = [
    project.power_installed_kwp && { label: 'Potência', value: `${project.power_installed_kwp} kWp` },
    project.module_count && { label: 'Módulos', value: project.module_count },
    project.inverter_brand && { label: 'Inversor', value: project.inverter_brand },
  ].filter((stat) => !!stat)

  return (
    <Link
      href={`/projetos/${project.slug}`}
      className={`group grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-brand-400/50 ${
        featured ? 'md:col-span-2' : ''
      } ${featured && cover ? 'md:grid-cols-2' : ''}`}
    >
      {cover && (
        <div className={`overflow-hidden ${featured ? 'aspect-video md:aspect-auto md:min-h-96' : 'aspect-video'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-col justify-between gap-10 p-6 md:p-10">
        <div>
          <p className="text-sm font-medium text-brand-300">
            <span className="capitalize">{project.project_type}</span>
            {project.project_type && location && ' · '}
            {location}
          </p>
          <h3 className={`mt-3 font-semibold tracking-tight text-white ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
            {project.title}
          </h3>
          {project.description && (
            <p className="mt-4 line-clamp-3 max-w-prose text-slate-300">{project.description}</p>
          )}
        </div>

        {stats.length > 0 && (
          <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs text-slate-400">{stat.label}</dt>
                <dd className="mt-1 text-lg font-semibold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Link>
  )
}

export default function ProjectCases({ projects }: { projects: ProjectCase[] }) {
  return (
    <section className="bg-slate-950 pt-16 pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Quem já gera a própria energia.
          </h2>
          <Link href="/projetos" className="text-sm font-medium text-brand-300 hover:text-brand-200">
            Ver todos os projetos →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <CaseCard key={project.id} project={project} featured={i === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}
