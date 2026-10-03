import Hero from '@/components/site/Hero'
import Stats from '@/components/site/Stats'
import FeaturedProjects from '@/components/site/FeaturedProjects'
import Solutions from '@/components/site/Solutions'
import FeaturedKits from '@/components/site/FeaturedKits'
import Technology from '@/components/site/Technology'
import Videos from '@/components/site/Videos'
import Testimonials from '@/components/site/Testimonials'
import Process from '@/components/site/Process'
import FAQ from '@/components/site/FAQ'
import FinalCTA from '@/components/site/FinalCTA'
import { ScrollStory } from '@/components/site/ScrollStory'

export default async function HomePage() {
  return (
    <div>
      {/* HERO */}
      <Hero />

      {/* SCROLL STORY - Apple-style scroll effect */}
      <ScrollStory />

      {/* PROVA / NÚMEROS */}
      <Stats />

      {/* PROJETOS EM DESTAQUE */}
      <FeaturedProjects />

      {/* SOLUÇÕES */}
      <Solutions />

      {/* KITS EM DESTAQUE */}
      <FeaturedKits />

      {/* TECNOLOGIA / EQUIPAMENTOS */}
      <Technology />

      {/* VÍDEOS */}
      <Videos />

      {/* DEPOIMENTOS */}
      <Testimonials />

      {/* PROCESSO */}
      <Process />

      {/* FAQ */}
      <FAQ />

      {/* CTA FINAL */}
      <FinalCTA />
    </div>
  )
}