import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnimatedHero from './components/AnimatedHero'
import Reveal from './components/Reveal'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: heroSetting }, { data: featuredKits }, { data: featuredProjects }, { data: testimonials }] =
    await Promise.all([
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_video')
        .maybeSingle(),
      supabase
        .from('kits')
        .select('id, name, slug, power_kwp, category, price, show_price')
        .eq('status', 'published')
        .eq('is_featured', true)
        .limit(3),
      supabase
        .from('projects')
        .select('id, title, slug, city, state, power_installed_kwp')
        .eq('status', 'published')
        .eq('is_featured', true)
        .limit(3),
      supabase
        .from('testimonials')
        .select('id, client_name, city, content, rating')
        .eq('is_published', true)
        .limit(3),
    ])

  return (
    <div>
      {/* HERO */}
        <AnimatedHero videoUrl={(heroSetting?.value as { url?: string } | null)?.url} />

      {/* KITS EM DESTAQUE */}
      {featuredKits && featuredKits.length > 0 && (
        <Reveal>
          <section id="solucoes" className="bg-slate-50 py-20">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                Kits em destaque
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {featuredKits.map((kit) => (
                  <Link
                    key={kit.id}
                    href={`/kits/${kit.slug}`}
                    className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-md"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {kit.category}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      {kit.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {kit.power_kwp} kWp
                    </p>
                    <p className="mt-4 text-sm font-medium text-slate-900">
                      {kit.show_price && kit.price
                        ? `A partir de R$ ${Number(kit.price).toLocaleString('pt-BR')}`
                        : 'Sob consulta'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* PROJETOS EM DESTAQUE */}
      {featuredProjects && featuredProjects.length > 0 && (
        <Reveal>
          <section className="py-20">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                Projetos realizados
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {featuredProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projetos/${project.slug}`}
                    className="rounded-xl border border-slate-200 p-6 transition hover:shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.city}/{project.state} —{' '}
                      {project.power_installed_kwp} kWp
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* DEPOIMENTOS */}
      {testimonials && testimonials.length > 0 && (
        <Reveal>
          <section className="bg-slate-50 py-20">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                O que nossos clientes dizem
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-slate-200 bg-white p-6"
                  >
                    {t.rating && (
                      <p className="text-amber-400">
                        {'⭐'.repeat(t.rating)}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-slate-600">“{t.content}”</p>
                    <p className="mt-4 text-sm font-medium text-slate-900">
                      {t.client_name}
                    </p>
                    {t.city && (
                      <p className="text-xs text-slate-400">{t.city}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* CTA FINAL */}
      <Reveal>
        <section className="py-20 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Pronto para gerar sua própria energia?
            </h2>
            <p className="mt-3 text-slate-600">
              Fale com nosso time e receba uma proposta sob medida para o seu
              consumo.
            </p>
            <Link
              href="/contato"
              className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Solicitar orçamento
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  )
}