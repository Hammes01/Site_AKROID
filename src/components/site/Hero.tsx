'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import Link from 'next/link';

// Create motion components from Next.js Link
const MotionLink = motion(Link);

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Parallax transform for the image - only apply if not reduced motion
  const yTransform = useTransform(scrollY, [0, 600], [0, prefersReducedMotion ? 0 : 100]);

  // Easing function as array (cubic-bezier)
  const easeOutCubic = [0.25, 0.46, 0.45, 0.94] as const;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: easeOutCubic,
      },
    },
  };

  // Button variants - defined as separate objects for each delay
  const buttonVariants1 = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOutCubic,
        delay: 0.2,
      },
    },
  };

  const buttonVariants2 = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOutCubic,
        delay: 0.3,
      },
    },
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
      aria-labelledby="hero-heading"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Subtle gradient mesh background */}
        <div
          className="absolute top-1/4 left-1/4 w-150 h-150 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-125 h-125 rounded-full bg-slate-900/5 blur-3xl"
          aria-hidden="true"
        />
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-700 text-sm font-medium mb-6 border border-amber-200"
            >
              <span className="relative flex h-1.5 w-1.5">
                <motion.span
                  className="absolute inset-0 rounded-full bg-amber-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: prefersReducedMotion ? 'none' : 'block' }}
                />
              </span>
              Engenharia Solar Fotovoltaica
            </motion.div>

            <motion.h1
              id="hero-heading"
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.1]"
            >
              Engenharia que transforma
              <br className="hidden sm:block" />
              <span className="text-amber-600">energia em resultado.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Projetos, instalação e engenharia de energia solar feitos para durar
              décadas — não só até a próxima fatura de luz.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <MotionLink
                href="/contato"
                variants={buttonVariants1}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-medium text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Solicitar orçamento
                <motion.span
                  className="inline-block transition-transform group-hover:translate-x-1"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: prefersReducedMotion ? 'none' : 'inline-block' }}
                >
                  →
                </motion.span>
              </MotionLink>

              <MotionLink
                href="/projetos"
                variants={buttonVariants2}
                className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-8 py-4 text-base font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Ver projetos realizados
              </MotionLink>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-amber-500 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-slate-700">500+</span>
                <span>instalações</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-amber-500 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-slate-700">15+</span>
                <span>anos de experiência</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-amber-500 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-slate-700">25 anos</span>
                <span>garantia de performance</span>
              </div>
            </motion.div>
          </div>

          {/* Image/Visual Content */}
          <motion.div
            variants={itemVariants}
            className="relative"
            style={{ y: yTransform }}
          >
            <div className="relative aspect-4/3 lg:aspect-5/4 rounded-2xl overflow-hidden bg-slate-100 shadow-2xl">
              {/* Placeholder for real installation image */}
              <div className="absolute inset-0 bg-linear-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90">
                {/* Decorative solar panel pattern */}
                <div className="absolute inset-0 opacity-5" aria-hidden="true">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <rect width="18" height="18" fill="none" stroke="currentColor" strokeWidth="0.5" rx="2" />
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
                  <div className="mb-6 flex items-center justify-center gap-3">
                    <motion.div
                      className="h-16 w-16 rounded-full border-2 border-amber-500/50 flex items-center justify-center"
                      animate={{ rotate: prefersReducedMotion ? 0 : 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      style={{ display: prefersReducedMotion ? 'none' : 'block' }}
                    >
                      <svg
                        className="h-8 w-8 text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </motion.div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-amber-300">Instalação Real</p>
                      <p className="text-xs text-slate-300">Usina Fotovoltaica 150 kWp</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="border-r border-white/20 last:border-0">
                      <p className="text-2xl sm:text-3xl font-bold text-white">150</p>
                      <p className="text-xs text-slate-300">kWp Instalados</p>
                    </div>
                    <div className="border-r border-white/20 last:border-0">
                      <p className="text-2xl sm:text-3xl font-bold text-white">220</p>
                      <p className="text-xs text-slate-300">MWh/ano</p>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-white">120t</p>
                      <p className="text-xs text-slate-300">CO₂/ano evitado</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute bottom-6 right-6 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium"
                animate={{ y: prefersReducedMotion ? 0 : [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: prefersReducedMotion ? 'none' : 'block' }}
              >
                Projeto Akroid • Ribeirão Preto/SP
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: prefersReducedMotion ? 'none' : 'flex' }}
            >
              <span className="hidden sm:block">Role para explorar</span>
              <motion.div
                className="h-6 w-1.5 rounded-full bg-slate-300 relative overflow-hidden"
              >
                <motion.div
                  className="absolute top-0 left-0 right-0 h-2 bg-amber-500 rounded-full"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}