'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export default function AnimatedHero({
  videoUrl,
  region,
  cta,
}: {
  videoUrl?: string
  region?: string | null
  cta: { href: string; label: string }
}) {
  const ref = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- necessário para evitar mismatch de hidratação entre servidor e cliente
    setMounted(true)
  }, [])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Vídeo: esmaece e desfoca suavemente enquanto sai de cena (scroll)
  const videoOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const blurAmount = useTransform(scrollYProgress, [0, 0.7], [0, 14])
  const videoBlur = useTransform(blurAmount, (v) => `blur(${v}px)`)

  // Texto: sobe e esmaece um pouco antes do vídeo
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80])

  const videoStyle =
    mounted && !shouldReduceMotion
      ? { opacity: videoOpacity, scale: videoScale, filter: videoBlur }
      : {}
  const textStyle =
    mounted && !shouldReduceMotion ? { opacity: textOpacity, y: textY } : {}

  return (
    <section
      ref={ref}
      className={`relative flex h-[90vh] min-h-[600px] items-center justify-center overflow-hidden text-center ${
        videoUrl ? 'bg-slate-950' : ''
      }`}
    >
      {videoUrl && (
        <motion.video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          style={videoStyle}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Camada escura por cima do vídeo, pra garantir contraste do texto */}
      {videoUrl && <div className="absolute inset-0 bg-black/40" />}

      {/* Dissolve a base do vídeo na seção escura que vem logo abaixo */}
      {videoUrl && (
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-slate-950 to-transparent" />
      )}

      <motion.div
        style={textStyle}
        className={`relative z-10 mx-auto max-w-3xl px-4 ${
          videoUrl ? 'text-white' : 'text-slate-900'
        }`}
      >
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
          Reduza sua conta de luz
          <br className="hidden md:block" /> com energia solar
          {region ? ` em ${region}` : ''}.
        </h1>
        <p
          className={`mx-auto mt-6 max-w-2xl text-lg ${
            videoUrl ? 'text-white/90' : 'text-slate-600'
          }`}
        >
          Projeto, instalação e engenharia de energia solar fotovoltaica,
          feitos para durar décadas — não só até a próxima fatura de luz.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href={cta.href}
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-400"
          >
            {cta.label}
          </Link>
          <Link
            href="/projetos"
            className={`rounded-full border px-6 py-3 text-sm font-medium ${
              videoUrl
                ? 'border-white/40 text-white hover:bg-white/10'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Ver projetos realizados
          </Link>
        </div>
      </motion.div>
    </section>
  )
}