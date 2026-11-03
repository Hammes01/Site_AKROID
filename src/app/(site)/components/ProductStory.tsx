'use client'

import dynamic from 'next/dynamic'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { PanelVariant } from './ProductScene'

// O three.js é pesado: só carrega no navegador, sem atrasar o vídeo do topo.
const ProductScene = dynamic(() => import('./ProductScene'), { ssr: false })

// Os datasheets não dizem o material do encapsulante, então o texto não diz EVA nem POE
const VARIANTS: { id: PanelVariant; label: string; text: string }[] = [
  {
    id: 'vidro',
    label: 'Vidro-vidro',
    text: 'Vidro, encapsulante, células TOPCon bifaciais e vidro traseiro, unidos em moldura de alumínio.',
  },
  {
    id: 'backsheet',
    label: 'Backsheet transparente',
    text: 'Vidro, encapsulante, células TOPCon bifaciais e backsheet transparente, unidos em moldura de alumínio.',
  },
]

// A animação termina com o inversor e o microinversor juntos; a comparação entre os dois
// fica na seção seguinte (InverterCompare).
const STORY_END = 0.76

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
    text: VARIANTS[0].text,
    range: [0.3, 0.34, 0.45, 0.49],
  },
  {
    eyebrow: 'Inversor e microinversor',
    title: 'O coração do sistema.',
    text: 'Os dois fazem a mesma função: convertem a corrente contínua dos módulos em corrente alternada, pronta para abastecer sua casa ou empresa.',
    range: [0.55, 0.6, STORY_END, 0.8],
  },
]

const LAYERS_CHAPTER = 1

function VariantToggle({
  variant,
  onChange,
}: {
  variant: PanelVariant
  onChange: (variant: PanelVariant) => void
}) {
  return (
    <div role="group" aria-label="Tipo de módulo" className="flex flex-wrap gap-2">
      {VARIANTS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={variant === option.id}
          onClick={() => onChange(option.id)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            variant === option.id
              ? 'border-brand-300 bg-brand-300/15 text-brand-200'
              : 'border-white/20 text-slate-300 hover:border-brand-300 hover:text-brand-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Chapter({
  chapter,
  progress,
  text = chapter.text,
  children,
}: {
  chapter: (typeof CHAPTERS)[number]
  progress: MotionValue<number>
  text?: string
  children?: ReactNode
}) {
  const opacity = useTransform(progress, chapter.range, [0, 1, 1, 0])
  const y = useTransform(progress, chapter.range, [36, 0, 0, -36])
  // Enquanto o texto está invisível, os botões não podem receber clique nem foco
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
          {text}
        </p>
        {children && (
          <motion.div style={{ visibility }} className="pointer-events-auto mt-6">
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function ProductStory() {
  const ref = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [variant, setVariant] = useState<PanelVariant>('vidro')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- necessário para evitar mismatch de hidratação entre servidor e cliente
    setMounted(true)
  }, [])

  // Começa quando a seção entra por baixo da tela, para o objeto já subir junto
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })
  const progress = useTransform(scrollYProgress, [0, 1], [0, STORY_END])

  if (mounted && shouldReduceMotion) {
    return (
      <section data-dark-section className="bg-slate-950 py-24">
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
        </div>
      </section>
    )
  }

  return (
    // Altura proporcional ao trecho da animação que ficou (antes 500svh para ela inteira)
    <section ref={ref} data-dark-section className="relative h-[380svh] bg-slate-950">
      <div className="sticky top-0 h-svh overflow-hidden bg-[radial-gradient(ellipse_at_70%_45%,#1e293b_0%,#020617_68%)] max-md:bg-[radial-gradient(ellipse_at_50%_35%,#1e293b_0%,#020617_70%)]">
        {/* Faz a emenda com o fim do vídeo, sem linha visível entre as seções */}
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-slate-950 to-transparent" />

        <ProductScene progress={progress} variant={variant} />

        {/* No celular, escurece a base para o texto nunca brigar com o objeto */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent md:hidden" />

        <div className="pointer-events-none absolute inset-0">
          {CHAPTERS.map((chapter, i) =>
            i === LAYERS_CHAPTER ? (
              <Chapter
                key={chapter.title}
                chapter={chapter}
                progress={progress}
                text={VARIANTS.find((option) => option.id === variant)!.text}
              >
                <VariantToggle variant={variant} onChange={setVariant} />
              </Chapter>
            ) : (
              <Chapter key={chapter.title} chapter={chapter} progress={progress} />
            )
          )}
        </div>
      </div>
    </section>
  )
}
