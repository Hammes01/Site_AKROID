'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

export default function Reveal({
  children,
}: {
  children: React.ReactNode
}) {
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

    useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- necessário para evitar mismatch de hidratação entre servidor e cliente
    setMounted(true)
  }, [])

  // Antes de montar, renderiza exatamente igual ao servidor
  // (sem nenhum wrapper extra) — evita o mismatch de hidratação.
  if (!mounted || shouldReduceMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}