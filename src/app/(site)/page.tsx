import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { parseSalesConfig } from '@/lib/sales-config'
import AboutSection from './components/AboutSection'
import AnimatedHero from './components/AnimatedHero'
import Faq from './components/Faq'
import KitsAndPayment, { type HomeKit } from './components/KitsAndPayment'
import ProductStory from './components/ProductStory'
import ProjectCases, {
  type CaseResult,
  type CaseTestimonial,
  type ProjectCase,
} from './components/ProjectCases'
import Reveal from './components/Reveal'
import Simulator from './components/Simulator'

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: heroSetting },
    { data: salesSetting },
    { data: featuredKits },
    { data: projects },
    { data: testimonials },
    { data: results },
  ] = await Promise.all([
    supabase.from('site_settings').select('value').eq('key', 'hero_video').maybeSingle(),
    supabase.from('site_settings').select('value').eq('key', 'sales_config').maybeSingle(),
    supabase
      .from('kits')
      .select('*, kit_items(quantity, products(name, brand, model))')
      .eq('status', 'published')
      .eq('is_featured', true)
      .limit(3),
    supabase
      .from('projects')
      .select('*, project_media(url, phase, sort_order)')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('installed_at', { ascending: false, nullsFirst: false })
      .limit(5),
    supabase.from('testimonials').select('*').eq('is_published', true).limit(12),
    // Só retorna linhas que o admin ativou; a regra do banco barra as demais
    supabase.from('project_results').select('project_id, bill_before, bill_after'),
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

      {/* CASES E DEPOIMENTOS */}
      <ProjectCases
        projects={(projects ?? []) as ProjectCase[]}
        testimonials={(testimonials ?? []) as CaseTestimonial[]}
        results={(results ?? []) as CaseResult[]}
      />

      {/* QUEM CUIDA DO SEU PROJETO */}
      <AboutSection
        steps={sales.processSteps}
        trustItems={sales.trustItems}
        story={sales.aboutText}
        photoUrl={sales.aboutPhotoUrl}
      />

      {/* SIMULADOR DE ECONOMIA */}
      {sales.simulator && <Simulator config={sales.simulator} />}

      {/* KITS E FORMAS DE PAGAMENTO */}
      <KitsAndPayment
        kits={(featuredKits ?? []) as HomeKit[]}
        simulator={sales.simulator}
        whatsapp={sales.whatsapp}
        cashDiscountPercent={sales.cashDiscountPercent}
        cardInstallments={sales.cardInstallments}
      />

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