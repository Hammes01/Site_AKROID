import Link from 'next/link'

export type ProjectCase = {
  id: string
  title: string
  slug: string
  city: string | null
  state: string | null
  power_installed_kwp: number | null
  project_type: string | null
  module_count: number | null
  inverter_brand: string | null
  inverter_type?: string | null
  monthly_generation_kwh?: number | null
  description: string | null
  project_media: { url: string; phase: string | null; sort_order: number | null }[]
}

export type CaseTestimonial = {
  id: string
  client_name: string
  client_company: string | null
  role: string | null
  city: string | null
  content: string | null
  photo_url: string | null
  project_id?: string | null
}

export type CaseResult = {
  project_id: string
  bill_before: number | null
  bill_after: number | null
}

function brl(value: number) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

// Prefere a foto do resultado final; se não houver, usa a primeira da galeria.
function getCover(media: ProjectCase['project_media']) {
  const sorted = [...media].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  return (sorted.find((item) => item.phase === 'depois') ?? sorted[0])?.url
}

function getInverterStat(project: ProjectCase) {
  const type = project.inverter_type === 'microinversor' ? 'Microinversor' : 'Inversor'
  if (project.inverter_brand) return { label: type, value: project.inverter_brand }
  return project.inverter_type ? { label: 'Equipamento', value: type } : null
}

function Author({ testimonial }: { testimonial: CaseTestimonial }) {
  const details = [testimonial.role, testimonial.client_company, testimonial.city]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mt-4 flex items-center gap-3">
      {testimonial.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={testimonial.photo_url}
          alt={testimonial.client_name}
          loading="lazy"
          className="h-10 w-10 rounded-full object-cover"
        />
      )}
      <div>
        <p className="text-sm font-medium text-white">{testimonial.client_name}</p>
        {details && <p className="text-xs text-slate-400">{details}</p>}
      </div>
    </div>
  )
}

function CaseCard({
  project,
  testimonial,
  result,
  featured,
}: {
  project: ProjectCase
  testimonial?: CaseTestimonial
  result?: CaseResult
  featured: boolean
}) {
  const cover = getCover(project.project_media ?? [])
  const location = [project.city, project.state].filter(Boolean).join('/')
  const inverter = getInverterStat(project)
  const stats = [
    project.power_installed_kwp && { label: 'Potência', value: `${project.power_installed_kwp} kWp` },
    project.module_count && { label: 'Módulos', value: project.module_count },
    inverter,
    project.monthly_generation_kwh && {
      label: 'Geração real',
      value: `${Number(project.monthly_generation_kwh).toLocaleString('pt-BR')} kWh/mês`,
    },
  ].filter((stat) => !!stat)
  const showBill = result?.bill_before != null && result?.bill_after != null

  return (
    <article
      className={`grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] ${
        featured ? 'md:col-span-2' : ''
      } ${featured && cover ? 'md:grid-cols-2' : ''}`}
    >
      {cover && (
        <div className={`overflow-hidden ${featured ? 'aspect-video md:aspect-auto md:min-h-96' : 'aspect-video'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={project.title} loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div>
          <p className="text-sm font-medium text-brand-300">
            <span className="capitalize">{project.project_type}</span>
            {project.project_type && location && ' · '}
            {location}
          </p>
          <h3 className={`mt-3 font-semibold tracking-tight text-white ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
            <Link href={`/projetos/${project.slug}`} className="hover:text-brand-300">
              {project.title}
            </Link>
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

        {showBill && (
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-slate-400">Conta de luz</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {brl(result.bill_before!)} <span aria-hidden="true">→</span>
              <span className="sr-only"> para </span>{' '}
              <span className="text-brand-300">{brl(result.bill_after!)}</span>
            </p>
          </div>
        )}

        {testimonial?.content && (
          <blockquote className="border-l-2 border-brand-400 pl-4">
            <p className="text-slate-200">“{testimonial.content}”</p>
            <Author testimonial={testimonial} />
          </blockquote>
        )}
      </div>
    </article>
  )
}

export default function ProjectCases({
  projects,
  testimonials,
  results,
}: {
  projects: ProjectCase[]
  testimonials: CaseTestimonial[]
  results: CaseResult[]
}) {
  const withContent = testimonials.filter((testimonial) => testimonial.content)
  const projectIds = new Set(projects.map((project) => project.id))

  // Cada case recebe um depoimento; os demais viram citações menores abaixo
  const byProject = new Map<string, CaseTestimonial>()
  for (const testimonial of withContent) {
    if (testimonial.project_id && projectIds.has(testimonial.project_id) && !byProject.has(testimonial.project_id)) {
      byProject.set(testimonial.project_id, testimonial)
    }
  }
  const usedIds = new Set([...byProject.values()].map((testimonial) => testimonial.id))
  const quotes = withContent.filter((testimonial) => !usedIds.has(testimonial.id))

  if (projects.length === 0 && quotes.length === 0) return null

  return (
    <section data-dark-section className="bg-slate-950 pt-16 pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Quem já gera a própria energia.
          </h2>
          {projects.length > 0 && (
            <Link href="/projetos" className="text-sm font-medium text-brand-300 hover:text-brand-200">
              Ver todos os projetos →
            </Link>
          )}
        </div>

        {projects.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((project, i) => (
              <CaseCard
                key={project.id}
                project={project}
                testimonial={byProject.get(project.id)}
                result={results.find((result) => result.project_id === project.id)}
                featured={i === 0}
              />
            ))}
          </div>
        )}

        {quotes.length > 0 && (
          <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {quotes.map((quote) => (
              <li key={quote.id} className="rounded-2xl border border-white/10 p-6">
                <blockquote>
                  <p className="text-slate-300">“{quote.content}”</p>
                  <Author testimonial={quote} />
                </blockquote>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
