'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  FAULTY_PANEL,
  INITIAL_STATE,
  NORMAL_WATTS,
  PANEL_COUNT,
  recommend,
  simulate,
  type InverterMode,
  type PanelStatus,
  type QuizAnswers,
  type SimState,
} from '@/lib/inverter-sim'
import type { RoofLayout } from './RoofScene'

// O three.js é pesado: só carrega no navegador
const RoofScene = dynamic(() => import('./RoofScene'), { ssr: false })

type Cta = { href: string; label: string }
export type FeaturedProject = { title: string; slug: string; city: string | null }

const MODES: { id: InverterMode; label: string; text: string }[] = [
  {
    id: 'string',
    label: 'Inversor string',
    text: 'Ótimo custo em sistemas grandes e sem sombra. As placas são ligadas em série, em duas séries de 4, até um inversor único na parede.',
  },
  {
    id: 'micro',
    label: 'Microinversor',
    text: 'Ideal para telhados com sombra ou várias orientações. Cada placa é monitorada e protegida separadamente.',
  },
]

const STATUS_STYLE: Record<PanelStatus, { text: string; dot: string; label: string }> = {
  normal: { text: 'text-brand-300', dot: 'bg-brand-400', label: 'Normal' },
  reduzida: { text: 'text-amber-300', dot: 'bg-amber-400', label: 'Produção reduzida' },
  parada: { text: 'text-slate-400', dot: 'bg-slate-500', label: 'Parada' },
}

const QUESTIONS: { key: keyof QuizAnswers; text: string }[] = [
  { key: 'shadeOrOrientations', text: 'Seu telhado tem sombra ou placas em várias orientações?' },
  { key: 'largeNoObstacles', text: 'O sistema é grande e o telhado não tem obstáculos?' },
]

const RESULTS = {
  micro: {
    title: 'Microinversor',
    text: 'Ideal para telhados com sombra ou várias orientações. Cada placa é monitorada e protegida separadamente.',
  },
  string: {
    title: 'Inversor string',
    text: 'Ótimo custo em sistemas grandes e sem sombra.',
  },
  depende: {
    title: 'Depende, fale conosco',
    text: 'Seu telhado tem um pouco de cada lado. Na visita técnica olhamos o local e indicamos o que faz mais sentido.',
  },
}

function watts(value: number) {
  return `${value.toLocaleString('pt-BR')} W`
}

function Toggle({
  pressed,
  onClick,
  children,
  tone = 'brand',
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
  tone?: 'brand' | 'danger'
}) {
  const on =
    tone === 'danger' ? 'border-red-400 bg-red-500/15 text-red-200' : 'border-brand-300 bg-brand-300/15 text-brand-200'
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 ${
        pressed ? on : 'border-white/20 text-slate-200 hover:border-brand-300 hover:text-brand-200'
      }`}
    >
      {children}
    </button>
  )
}

function Quiz({ project }: { project: FeaturedProject | null }) {
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const complete = QUESTIONS.every((question) => answers[question.key] !== undefined)
  const result = complete ? RESULTS[recommend(answers as QuizAnswers)] : null

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
      <h3 className="text-2xl font-semibold tracking-tight text-white">Qual combina com o seu telhado?</h3>
      <div className="mt-6 space-y-5">
        {QUESTIONS.map((question) => (
          <fieldset key={question.key}>
            <legend className="text-slate-200">{question.text}</legend>
            <div className="mt-2 flex gap-2">
              {[
                { value: true, label: 'Sim' },
                { value: false, label: 'Não' },
              ].map((option) => (
                <Toggle
                  key={option.label}
                  pressed={answers[question.key] === option.value}
                  onClick={() => setAnswers({ ...answers, [question.key]: option.value })}
                >
                  {option.label}
                </Toggle>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div aria-live="polite">
        {result && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-sm text-slate-400">Nossa sugestão</p>
            <p className="mt-1 text-2xl font-semibold text-brand-300">{result.title}</p>
            <p className="mt-2 text-slate-300">{result.text}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Link
                href="/contato"
                className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-400"
              >
                Solicitar orçamento
              </Link>
              {project && (
                <Link href={`/projetos/${project.slug}`} className="text-sm font-medium text-brand-300 hover:text-brand-200">
                  Veja o projeto {project.title}
                  {project.city && `, em ${project.city}`} →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InverterCompare({ cta, project }: { cta: Cta; project: FeaturedProject | null }) {
  const [state, setState] = useState<SimState>(INITIAL_STATE)
  const [layout, setLayout] = useState<RoofLayout | null>(null)
  const sim = useMemo(() => simulate(state), [state])
  const isString = state.mode === 'string'
  const mode = MODES.find((option) => option.id === state.mode)!

  const toggleShade = (index: number) =>
    setState((current) => ({
      ...current,
      shaded: current.shaded.includes(index)
        ? current.shaded.filter((i) => i !== index)
        : [...current.shaded, index],
    }))
  const toggle = (key: 'panelFault' | 'equipmentFault' | 'emergency' | 'rapidShutdown') =>
    setState((current) => ({ ...current, [key]: !current[key] }))

  return (
    <section id="inversores" data-dark-section className="scroll-mt-20 bg-slate-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-300">Microinversor · A conversão junto do módulo</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-6xl">Cada telhado é um caso.</h2>
          <p className="mt-5 text-lg text-slate-300">
            Instalado junto aos módulos, faz com que a sombra em um deles pese menos no restante do sistema. Compare
            com o inversor string: toque nas placas para fazer sombra e teste as situações abaixo.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Tipo de inversor" className="flex rounded-full border border-white/15 p-1">
            {MODES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={state.mode === option.id}
                onClick={() => setState({ ...INITIAL_STATE, mode: option.id })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-300 ${
                  state.mode === option.id ? 'bg-brand-500 text-white' : 'text-slate-200 hover:text-brand-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-slate-300">{mode.text}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div>
            <div className="relative aspect-square overflow-hidden sm:aspect-[4/3] rounded-2xl bg-[radial-gradient(ellipse_at_50%_30%,#1e293b_0%,#020617_75%)] md:aspect-[16/10]">
              <RoofScene mode={state.mode} sim={sim} onLayout={setLayout} />

              {/* Toque direto na placa. Pelo teclado, use a lista de placas ao lado. */}
              {layout && (
                <div aria-hidden="true" className="absolute inset-0">
                  {layout.panels.map((rect, i) => {
                    const panel = sim.panels[i]
                    return (
                      <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        onClick={() => toggleShade(i)}
                        style={{ left: `${rect.left}%`, top: `${rect.top}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
                        className="absolute flex items-center justify-center rounded-sm hover:bg-white/5"
                      >
                        <span
                          className={`rounded-full bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap tabular-nums sm:px-2 md:text-xs ${STATUS_STYLE[panel.status].text}`}
                        >
                          {watts(panel.watts)}
                        </span>
                      </button>
                    )
                  })}
                  {(isString ? [layout.inverter] : layout.micros).map((point, i) => (
                    <span
                      key={i}
                      style={{ left: `${point.left}%`, top: `${point.top}%` }}
                      className="pointer-events-none absolute -translate-x-1/2 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] text-slate-200 md:text-xs"
                    >
                      {isString ? 'Inversor' : `Micro ${i + 1}`}
                    </span>
                  ))}
                  <span
                    style={{ left: `${layout.board.left}%`, top: `${layout.board.top}%` }}
                    className="pointer-events-none absolute -translate-x-1/2 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] text-slate-200 md:text-xs"
                  >
                    Quadro
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Toggle pressed={state.panelFault} onClick={() => toggle('panelFault')}>
                Falha numa placa
              </Toggle>
              <Toggle pressed={state.equipmentFault} onClick={() => toggle('equipmentFault')}>
                Falha no equipamento
              </Toggle>
              <Toggle pressed={state.emergency} onClick={() => toggle('emergency')} tone="danger">
                Emergência (bombeiros)
              </Toggle>
              {isString && (
                <Toggle pressed={state.rapidShutdown} onClick={() => toggle('rapidShutdown')}>
                  String + desligamento rápido
                </Toggle>
              )}
              <button
                type="button"
                onClick={() => setState({ ...INITIAL_STATE, mode: state.mode })}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 underline-offset-4 hover:text-white hover:underline"
              >
                Reiniciar
              </button>
            </div>
            {state.panelFault && (
              <p className="mt-2 text-sm text-slate-400">A falha é simulada na placa {FAULTY_PANEL + 1}.</p>
            )}
          </div>

          <aside aria-label="Potência das placas" className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Potência agora (ilustrativa)</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-white">{watts(sim.total)}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand-400 transition-[width] duration-300"
                style={{ width: `${(sim.total / (NORMAL_WATTS * PANEL_COUNT)) * 100}%` }}
              />
            </div>

            <p
              aria-live="polite"
              className={`mt-4 rounded-lg p-3 text-sm ${
                sim.dcCables.includes('perigo') ? 'bg-red-500/15 text-red-200' : 'bg-white/5 text-slate-200'
              }`}
            >
              {sim.message}
            </p>

            <p className="mt-5 text-sm text-slate-400">Placas: toque para fazer sombra</p>
            <ul className="mt-2 grid grid-cols-4 gap-2">
              {sim.panels.map((panel) => (
                <li key={panel.index}>
                  <button
                    type="button"
                    aria-pressed={panel.shaded}
                    aria-label={`Placa ${panel.index + 1}: ${watts(panel.watts)}, ${STATUS_STYLE[panel.status].label.toLowerCase()}. ${
                      panel.shaded ? 'Tirar a sombra' : 'Fazer sombra'
                    }`}
                    onClick={() => toggleShade(panel.index)}
                    className={`w-full rounded-lg border px-1 py-2 text-center focus-visible:outline-2 focus-visible:outline-brand-300 ${
                      panel.shaded ? 'border-amber-400/60 bg-amber-400/10' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="block text-[11px] text-slate-400">Placa {panel.index + 1}</span>
                    <span className={`block text-sm font-semibold tabular-nums ${STATUS_STYLE[panel.status].text}`}>
                      {panel.watts}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <ul className="mt-5 space-y-1.5 text-xs text-slate-300">
              {Object.values(STATUS_STYLE).map((style) => (
                <li key={style.label} className="flex items-center gap-2">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  {style.label}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Cabo energizado na emergência
              </li>
            </ul>
          </aside>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Quiz project={project} />

          <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="font-semibold text-white">Desligamento rápido</h3>
            <p className="mt-2 text-sm text-slate-300">
              A NBR 17193:2025 prevê a função de desligamento rápido em instalações fotovoltaicas. Microinversores já
              cumprem essa função de forma nativa; inversores string precisam de dispositivo adicional.
            </p>
            <p className="mt-3 text-xs text-slate-400">As exigências dos corpos de bombeiros variam por estado.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8">
          <p className="max-w-xl text-sm text-slate-400">
            Simulação ilustrativa. O dimensionamento real depende do projeto e do equipamento escolhido.
          </p>
          <Link
            href={cta.href}
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-400"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  )
}
