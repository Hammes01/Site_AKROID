import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { parseSalesConfig } from '@/lib/sales-config'
import AnimatedHero from './components/AnimatedHero'
import Faq from './components/Faq'
import ProductStory from './components/ProductStory'
import ProjectCases from './components/ProjectCases'
import Reveal from './components/Reveal'
import Simulator from './components/Simulator'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: heroSetting }, { data: salesSetting }, { data: featuredKits }, { data: projects }, { data: testimonials }] =
    await Promise.all([
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_video')
        .maybeSingle(),
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'sales_config')
        .maybeSingle(),
      supabase
        .from('kits')
        .select('id, name, slug, power_kwp, category, price, show_price')
        .eq('status', 'published')
        .eq('is_featured', true)
        .limit(3),
      supabase
        .from('projects')
        .select(
          'id, title, slug, city, state, power_installed_kwp, project_type, module_count, inverter_brand, description, project_media(url, phase, sort_order)'
        )
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('installed_at', { ascending: false, nullsFirst: false })
        .limit(5),
      supabase
        .from('testimonials')
        .select('id, client_name, client_company, role, city, content, rating, photo_url')
        .eq('is_published', true)
        .limit(3),
    ])

  const sales = parseSalesConfig(salesSetting?.value)
  // Sem simulador configurado, os botões levam direto ao formulário
  const cta = sales.simulator
    ? { href: '#simulador', label: 'Simular minha economia' }
    : { href: '/contato', label: 'Solicitar orçamento' }

  return (
    <div className="-mt-18 md:-mt-20">
      {/* HERO */}
      <AnimatedHero
        videoUrl={(heroSetting?.value as { url?: string } | null)?.url}
        region={sales.region}
        cta={cta}
      />

      {/* PRODUTOS ANIMADOS PELO SCROLL */}
      <ProductStory cta={cta} />

      {/* CASES DE CLIENTES */}
      {projects && projects.length > 0 && <ProjectCases projects={projects} />}

      {/* PROVAS DE CONFIANÇA */}
      {sales.trustItems.length > 0 && (
        <section className="bg-brand-50 py-12">
          <ul className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
            {sales.trustItems.map((item) => (
              <li key={item} className="flex gap-3 font-medium text-brand-900">
                <span aria-hidden="true" className="text-brand-600">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* SIMULADOR DE ECONOMIA */}
      {sales.simulator && <Simulator config={sales.simulator} />}

      {/* KITS EM DESTAQUE */}
      {featuredKits && featuredKits.length > 0 && (
        <Reveal>
          <section id="solucoes" className="bg-slate-50 py-24">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
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

      {/* FORMAS DE PAGAMENTO */}
      {sales.financingText && (
        <Reveal>
          <section data-dark-section className="bg-brand-900 py-20 text-white">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Formas de pagamento
              </h2>
              <p className="mt-5 text-lg whitespace-pre-line text-brand-100">
                {sales.financingText}
              </p>
            </div>
          </section>
        </Reveal>
      )}

      {/* DEPOIMENTOS */}
      {testimonials && testimonials.length > 0 && (
        <Reveal>
          <section className="py-24">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
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
                    <div className="mt-4 flex items-center gap-3">
                      {t.photo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.photo_url}
                          alt={t.client_name}
                          loading="lazy"
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {t.client_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {[t.role, t.client_company, t.city].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* PERGUNTAS FREQUENTES */}
      <Faq />

      {/* CTA FINAL */}
      <Reveal>
        <section className="bg-slate-50 py-28 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
              Pronto para gerar sua própria energia?
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Fale com nosso time e receba uma proposta sob medida para o seu
              consumo.
            </p>
            <Link
              href="/contato"
              className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
            >
              Solicitar orçamento
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  )
}