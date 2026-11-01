'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'

// O three.js é pesado: só carrega no navegador, sem atrasar o vídeo do topo.
const ProductScene = dynamic(() => import('./ProductScene'), { ssr: false })

// `range`: pontos do scroll em que o texto aparece, fica e some.
const CHAPTERS = [
  {
    eyebrow: 'Módulo fotovoltaico',
    title: 'A energia começa aqui.',
    text: 'Cada módulo transforma a luz do sol em corrente contínua, em silêncio, todos os dias.',
    range: [0.17, 0.21, 0.27, 0.3],
  },
  {
    eyebrow: 'Por dentro do módulo',
    title: 'Camada por camada.',
    text: 'Vidro, encapsulante, células e backsheet, unidos em uma moldura de alumínio para enfrentar sol, chuva e vento.',
    range: [0.3, 0.34, 0.45, 0.49],
  },
  {
    eyebrow: 'Inversor',
    title: 'O coração do sistema.',
    text: 'Converte a corrente contínua dos módulos em corrente alternada, pronta para abastecer sua casa ou empresa.',
    range: [0.55, 0.6, 0.74, 0.78],
  },
  {
    eyebrow: 'Microinversor',
    title: 'A conversão junto do módulo.',
    text: 'Instalado junto aos módulos, faz com que a sombra em um deles pese menos no restante do sistema.',
    range: [0.83, 0.88, 0.99, 1],
  },
]

type Cta = { href: string; label: string }

function Chapter({
  chapter,
  progress,
  cta,
}: {
  chapter: (typeof CHAPTERS)[number]
  progress: MotionValue<number>
  cta?: Cta
}) {
  const opacity = useTransform(progress, chapter.range, [0, 1, 1, 0])
  const y = useTransform(progress, chapter.range, [36, 0, 0, -36])
  // Enquanto o texto está invisível, o botão não pode receber clique nem foco
  const visibility = useTransform(opacity, (value) => (value > 0.05 ? 'visible' : 'hidden'))

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-24 mx-auto max-w-6xl px-6 md:top-1/2 md:bottom-auto md:-translate-y-1/2"
    >
      <div className="max-w-md">
        <p className="text-sm font-medium text-brand-300">{chapter.eyebrow}</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          {chapter.title}
        </h2>
        <p className="mt-4 text-base text-slate-300 md:mt-6 md:text-xl">
          {chapter.text}
        </p>
        {cta && (
          <motion.div style={{ visibility }} className="pointer-events-auto mt-6">
            <Link
              href={cta.href}
              className="inline-block rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-400"
            >
              {cta.label}
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function ProductStory({ cta }: { cta: Cta }) {
  const ref = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- necessário para evitar mismatch de hidratação entre servidor e cliente
    setMounted(true)
  }, [])

  // Começa quando a seção entra por baixo da tela, para o objeto já subir junto
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })

  if (mounted && shouldReduceMotion) {
    return (
      <section className="bg-slate-950 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2">
          {CHAPTERS.map((chapter) => (
            <div key={chapter.title}>
              <p className="text-sm font-medium text-brand-300">{chapter.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {chapter.title}
              </h2>
              <p className="mt-4 text-slate-300">{chapter.text}</p>
            </div>
          ))}
          <Link
            href={cta.href}
            className="justify-self-start rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-400"
          >
            {cta.label}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="relative h-[500svh] bg-slate-950">
      <div className="sticky top-0 h-svh overflow-hidden bg-[radial-gradient(ellipse_at_70%_45%,#1e293b_0%,#020617_68%)] max-md:bg-[radial-gradient(ellipse_at_50%_35%,#1e293b_0%,#020617_70%)]">
        {/* Faz a emenda com o fim do vídeo, sem linha visível entre as seções */}
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-slate-950 to-transparent" />

        <ProductScene progress={scrollYProgress} />

        {/* No celular, escurece a base para o texto nunca brigar com o objeto */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent md:hidden" />

        <div className="pointer-events-none absolute inset-0">
          {CHAPTERS.map((chapter, i) => (
            <Chapter
              key={chapter.title}
              chapter={chapter}
              progress={scrollYProgress}
              cta={i === CHAPTERS.length - 1 ? cta : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
