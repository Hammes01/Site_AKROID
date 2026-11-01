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
const HEADER_CENTER_Y = 40

export type GlassTone = 'light' | 'dark'

export default function SiteHeader() {
  const pathname = usePathname()
  const [tone, setTone] = useState<GlassTone>('light')

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

  const dark = tone === 'dark'

  return (
    <header className="sticky top-0 z-50 px-3 pt-2 md:px-6">
      <div
        data-tone={tone}
        className="liquid-glass relative mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full pr-2.5 pl-5 transition-colors duration-300 md:h-18 md:pr-3 md:pl-7"
      >
        <Link
          href="/"
          aria-label="AKROID Energia Solar"
          className="relative block h-14 w-11 shrink-0 md:h-16 md:w-13"
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

        <nav aria-label="Menu principal" className="relative hidden gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-300 ${
                dark ? 'text-white/90 hover:text-white' : 'text-slate-800 hover:text-brand-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative flex items-center gap-2">
          <Link
            href="/contato"
            className={`rounded-full border px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
              dark
                ? 'border-white/35 bg-brand-400/30 text-white hover:bg-brand-400/45'
                : 'border-brand-700/30 bg-brand-500/25 text-brand-900 hover:bg-brand-500/40'
            }`}
          >
            Solicitar orçamento
          </Link>
          <MobileMenu links={NAV_LINKS} tone={tone} />
        </div>
      </div>
    </header>
  )
}
