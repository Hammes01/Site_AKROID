'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import MobileMenu from './MobileMenu'

const NAV_LINKS = [
  { label: 'Início', href: '/' },
  { label: 'Soluções', href: '/#solucoes' },
  { label: 'Projetos', href: '/projetos' },
  { label: 'Kits', href: '/kits' },
  { label: 'Conteúdos', href: '/blog' },
  { label: 'Contato', href: '/contato' },
]

// Altura em que o conteúdo é comparado com a barra para escolher as cores
const HEADER_CENTER_Y = 32

// Rolagem a partir da qual a barra recolhe, e a mínima para desfazer um toque no celular
const COMPACT_AFTER_Y = 60
const PEEK_SCROLL_THRESHOLD = 8

const SIZE_TRANSITION = 'transition-all duration-300 ease-out motion-reduce:transition-none'

export type GlassTone = 'light' | 'dark'

export default function SiteHeader() {
  const pathname = usePathname()
  const [tone, setTone] = useState<GlassTone>('light')
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [peeking, setPeeking] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Com a barra transparente, texto e botões acompanham o fundo: seções escuras
  // são marcadas com data-dark-section e o restante do site é tratado como claro.
  useEffect(() => {
    const update = () => {
      const isDark = [...document.querySelectorAll('[data-dark-section]')].some((section) => {
        const { top, bottom } = section.getBoundingClientRect()
        return top <= HEADER_CENTER_Y && bottom > HEADER_CENTER_Y
      })
      setTone(isDark ? 'dark' : 'light')
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  // Depois de rolar, a barra recolhe. Volta ao tamanho normal com o mouse em cima,
  // com o foco do teclado, com um toque no celular ou com o menu aberto.
  useEffect(() => {
    let lastY = window.scrollY

    const update = () => {
      const y = window.scrollY
      setScrolled(y > COMPACT_AFTER_Y)
      if (Math.abs(y - lastY) >= PEEK_SCROLL_THRESHOLD) {
        lastY = y
        setPeeking(false)
      }
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const dark = tone === 'dark'
  const compact = scrolled && !hovered && !focused && !peeking && !menuOpen

  return (
    // A altura fica reservada aqui, para a página não pular quando a barra muda de tamanho
    <header
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => setFocused(event.target.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
      className="sticky top-0 z-50 h-18 px-3 pt-2 md:h-20 md:px-6"
    >
      <div
        data-tone={tone}
        data-compact={compact}
        onClick={() => setPeeking(true)}
        className={`liquid-glass relative mx-auto flex max-w-6xl items-center justify-between rounded-2xl ${SIZE_TRANSITION} ${
          compact ? 'h-11 pr-1.5 pl-3 md:pr-2 md:pl-4' : 'h-16 pr-2.5 pl-5 md:h-18 md:pr-3 md:pl-7'
        }`}
      >
        <Link
          href="/"
          aria-label="AKROID Energia Solar"
          className={`relative block shrink-0 ${SIZE_TRANSITION} ${
            compact ? 'h-9 w-7' : 'h-14 w-11 md:h-16 md:w-13'
          }`}
        >
          <Image
            src="/logo-nav.png"
            alt=""
            fill
            sizes="52px"
            priority
            className={`object-contain transition-opacity duration-300 ${dark ? 'opacity-0' : 'opacity-100'}`}
          />
          <Image
            src="/logo-nav-light.png"
            alt=""
            fill
            sizes="52px"
            priority
            className={`object-contain transition-opacity duration-300 ${dark ? 'opacity-100' : 'opacity-0'}`}
          />
        </Link>

        <nav
          aria-label="Menu principal"
          className={`relative hidden md:flex ${SIZE_TRANSITION} ${
            compact ? 'gap-5 text-xs' : 'gap-6 text-sm'
          }`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-300 ${
                dark
                  ? 'text-white/90 hover:text-brand-300 focus-visible:text-brand-300'
                  : 'text-slate-800 hover:text-brand-700 focus-visible:text-brand-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative flex items-center gap-2">
          <Link
            href="/contato"
            className={`border font-medium whitespace-nowrap ${SIZE_TRANSITION} ${
              compact ? 'rounded-lg px-3 py-1 text-xs' : 'rounded-xl px-4 py-2.5 text-sm'
            } ${
              dark
                ? 'border-white/35 bg-brand-400/30 text-white hover:bg-brand-400/45'
                : 'border-brand-700/30 bg-brand-500/25 text-brand-900 hover:bg-brand-500/40'
            }`}
          >
            Solicitar orçamento
          </Link>
          <MobileMenu links={NAV_LINKS} tone={tone} compact={compact} onOpenChange={setMenuOpen} />
        </div>
      </div>
    </header>
  )
}
