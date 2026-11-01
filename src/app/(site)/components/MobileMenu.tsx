'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ICONS: Record<string, string> = {
  '/': 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5.5h4V20',
  '/#solucoes': 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  '/projetos': 'M3 19h18M5 19l2.5-11h9L19 19M6.2 13.5h11.6M10.5 8l-1 11M13.5 8l1 11',
  '/kits': 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3ZM4 7.5l8 4.5m0 0 8-4.5M12 12v9',
  '/blog': 'M5 4h11l3 3v13H5V4Zm3.5 6h7m-7 3.5h7m-7 3.5h4',
  '/contato': 'M4 5h16v11H9.5L5 20v-4H4V5Zm4 4.5h8M8 12.5h5',
}

const SPRING = { type: 'spring', stiffness: 460, damping: 34, mass: 0.8 } as const

function isCurrent(pathname: string, href: string) {
  if (href.includes('#')) return false
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function MobileMenu({
  links,
}: {
  links: { label: string; href: string }[]
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o portal usa document, que só existe no navegador
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    panelRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const line = 'absolute left-0 h-0.5 w-5 rounded-full bg-slate-900 transition duration-300 ease-out'

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        aria-controls="menu-celular"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/70 md:hidden"
      >
        <span aria-hidden="true" className="relative h-4 w-5">
          <span className={`${line} top-0 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`${line} top-[7px] ${open ? 'opacity-0' : ''}`} />
          <span className={`${line} top-[14px] ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </span>
      </button>

      {/* Fora do cabeçalho: o desfoque dele impediria o vidro de desfocar a página */}
      {mounted &&
        createPortal(
          <MotionConfig reducedMotion="user">
            <AnimatePresence>
              {open && (
                <div className="md:hidden">
                  <motion.button
                    type="button"
                    aria-label="Fechar menu"
                    tabIndex={-1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-55 bg-slate-950/15"
                  />
                  <motion.nav
                    ref={panelRef}
                    id="menu-celular"
                    aria-label="Menu principal"
                    tabIndex={-1}
                    initial={{ opacity: 0, scale: 0.4, y: -14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, y: -10 }}
                    transition={SPRING}
                    className="liquid-glass fixed top-18 right-3 z-60 w-[min(17.5rem,calc(100vw-1.5rem))] origin-top-right rounded-[1.75rem] p-2 outline-none"
                  >
                    <ul className="relative">
                      {links.map((link) => {
                        const current = isCurrent(pathname, link.href)

                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              aria-current={current ? 'page' : undefined}
                              onClick={() => setOpen(false)}
                              className={`flex min-h-12 items-center justify-between gap-4 rounded-[1.25rem] px-4 text-[1.0625rem] text-slate-950 transition-colors active:bg-white/50 ${
                                current ? 'liquid-glass-current font-semibold' : ''
                              }`}
                            >
                              {link.label}
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                className="h-5 w-5 shrink-0"
                              >
                                <path d={ICONS[link.href]} />
                              </svg>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </motion.nav>
                </div>
              )}
            </AnimatePresence>
          </MotionConfig>,
          document.body
        )}
    </>
  )
}
