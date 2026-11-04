'use client'

import { useEffect, useRef, useState } from 'react'

// Surge suave ao rolar até o bloco. Diferente do Reveal, mantém sempre a mesma
// div, então o que estiver dentro (como a cena 3D) não é montado de novo.
// O servidor entrega o conteúdo visível; só esconde o que ainda está abaixo da tela.
export default function FadeIn({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'idle' | 'hidden' | 'shown'>('idle')

  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (element.getBoundingClientRect().top < window.innerHeight) return

    setPhase('hidden')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setPhase('shown')
        observer.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={phase === 'shown' && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${className} ${phase === 'idle' ? '' : 'transition duration-700 ease-out'} ${
        phase === 'hidden' ? 'translate-y-8 opacity-0' : ''
      }`}
    >
      {children}
    </div>
  )
}
