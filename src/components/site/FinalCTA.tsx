'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { Zap, ArrowRight, MessageSquare } from 'lucide-react';

export default function FinalCTA() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      id="cta-final"
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" aria-hidden="true" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-125 h-125 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-100 h-100 rounded-full bg-amber-500/5 blur-3xl" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-3">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="cta-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <rect width="28" height="28" fill="none" stroke="currentColor" strokeWidth="0.3" rx="2" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#cta-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-6 border border-amber-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-amber-400"
              animate={{ scale: prefersReducedMotion ? 1 : [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: prefersReducedMotion ? 'none' : 'block' }}
            />
            Pronto para gerar sua própria energia?
          </motion.div>

          {/* Title */}
          <motion.h2
            id="cta-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Solicite seu orçamento
            <br />
            <span className="text-amber-400">sem compromisso</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Preencha o formulário e nossa equipe de engenharia entrará em contato
            em até 24h com uma proposta personalizada para seu consumo.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link
              href="/contato"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-slate-900 hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Zap className="h-5 w-5" aria-hidden="true" />
              Solicitar orçamento
              <motion.span
                className="inline-block transition-transform group-hover:translate-x-1"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: prefersReducedMotion ? 'none' : 'inline-block' }}
              >
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </motion.span>
            </Link>

            <a
              href="https://wa.me/5516999999999?text=Ol%C3%A1%2C%20gostaria%20de%20um%20or%C3%A7amento%20para%20energia%20solar"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 rounded-full border-2 border-slate-600 bg-transparent px-8 py-4 text-base font-semibold text-white hover:bg-slate-800 hover:border-slate-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
              Falar no WhatsApp
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-slate-200">Resposta em 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-slate-200">Engenharia própria</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-slate-200">Sem compromisso</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}