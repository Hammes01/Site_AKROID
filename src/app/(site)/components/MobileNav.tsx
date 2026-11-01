'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, MotionConfig } from 'motion/react'
import { useEffect, useState } from 'react'
import WhatsAppButton from './WhatsAppButton'

const ICONS = {
  home: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5.5h4V20',
  projects: 'M3 19h18M5 19l2.5-11h9L19 19M6.2 13.5h11.6M10.5 8l-1 11M13.5 8l1 11M12 5V3M6.5 5.5 5 4M17.5 5.5 19 4',
  kits: 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3ZM4 7.5l8 4.5m0 0 8-4.5M12 12v9',
  blog: 'M5 4h11l3 3v13H5V4Zm3.5 6h7m-7 3.5h7m-7 3.5h4',
  contact: 'M4 5h16v11H9.5L5 20v-4H4V5Zm4 4.5h8M8 12.5h5',
}

const TABS = [
  { label: 'Início', href: '/', icon: ICONS.home },
  { label: 'Projetos', href: '/projetos', icon: ICONS.projects },
  { label: 'Kits', href: '/kits', icon: ICONS.kits },
  { label: 'Conteúdos', href: '/blog', icon: ICONS.blog },
  { label: 'Contato', href: '/contato', icon: ICONS.contact },
]

// Distância mínima de rolagem para a barra mudar de tamanho, ignorando tremidas do dedo
const SCROLL_THRESHOLD = 8

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function MobileNav({ whatsapp }: { whatsapp: string | null }) {
  const pathname = usePathname()
  const [compact, setCompact] = useState(false)

  // Rolando para baixo a barra recolhe e libera a tela; rolando para cima ela volta
  useEffect(() => {
    let lastY = window.scrollY

    const handleScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < SCROLL_THRESHOLD) return
      lastY = y
      setCompact(delta > 0 && y > 80)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex items-stretch justify-center gap-2 px-3 md:hidden"
      >
        <ul
          className={`liquid-glass flex min-w-0 flex-1 items-stretch gap-0.5 rounded-full p-1.5 transition-[max-width] duration-300 ease-out ${
            compact ? 'max-w-70' : 'max-w-md'
          }`}
        >
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href)

            return (
              <li key={tab.href} className="min-w-0 flex-1">
                <Link
                  href={tab.href}
                  aria-label={tab.label}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-11 flex-col items-center justify-center rounded-full py-1 transition-colors ${
                    active ? 'text-brand-200' : 'text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="mobile-nav-active"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="liquid-glass-active absolute inset-0 rounded-full"
                    />
                  )}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="relative h-5 w-5"
                  >
                    <path d={tab.icon} />
                  </svg>
                  <span
                    aria-hidden="true"
                    className={`relative overflow-hidden text-[0.625rem] leading-3 font-medium transition-[max-height,opacity,margin] duration-300 ease-out max-[359px]:hidden ${
                      compact ? 'mt-0 max-h-0 opacity-0' : 'mt-0.5 max-h-3 opacity-100'
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {whatsapp && (
          <WhatsAppButton number={whatsapp} className="flex w-14.5 shrink-0" />
        )}
      </nav>
    </MotionConfig>
  )
}
