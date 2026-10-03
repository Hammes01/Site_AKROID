'use client';

import React, { useState, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

const stats: StatItem[] = [
  { label: 'Projetos realizados', value: 500, suffix: '+' },
  { label: 'kWp instalados', value: 15000, suffix: '+' },
  { label: 'Regiões atendidas', value: 12 },
  { label: 'Anos de experiência', value: 15, suffix: '+' },
];

export default function Stats() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      id="prova-numeros"
      className="py-16 sm:py-20 lg:py-24 bg-slate-50 border-y border-slate-100"
      aria-labelledby="stats-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2
            id="stats-heading"
            className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight"
          >
            Números que comprovam
            <br />
            <span className="text-amber-600">nossa engenharia</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Resultados reais de quem entrega energia solar com responsabilidade
            técnica e compromisso de longo prazo.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.article
              key={stat.label}
              className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: isInView ? index * 0.1 : 0,
              }}
              whileHover={{ y: -4 }}
            >
              {/* Decorative top accent */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-linear-to-r from-transparent via-amber-500 to-transparent"
                aria-hidden="true"
              />

              {/* Number */}
              <motion.div
                className="text-center"
                initial={false}
                animate={{
                  opacity: isInView ? 1 : 0,
                }}
                transition={{ duration: 0.01 }}
              >
                <CountUp
                  end={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  duration={prefersReducedMotion ? 0 : 2}
                  delay={index * 0.15}
                  isInView={isInView}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </motion.div>

              {/* Label */}
              <p className="mt-3 text-sm font-medium text-slate-600 text-center">
                {stat.label}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Subtle divider */}
        <motion.div
          className="mt-12 lg:mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
            <span className="px-4 text-xs font-medium uppercase tracking-wider text-slate-400">
              Dados atualizados em 2024
            </span>
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Separate CountUp component for cleaner animation logic
function CountUp({
  end,
  prefix = '',
  suffix = '',
  duration = 2,
  delay = 0,
  isInView,
  prefersReducedMotion,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  isInView: boolean;
  prefersReducedMotion: boolean;
}) {
  // Initialize with end value if reduced motion or not in view, otherwise 0
  const [count, setCount] = useState(() => {
    if (prefersReducedMotion || !isInView) return end;
    return 0;
  });

  useEffect(() => {
    // Only animate if in view and not reduced motion
    if (!isInView || prefersReducedMotion) return;

    let animationFrame: number;
    const startTime = Date.now() + delay * 1000;
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();

      if (now < startTime) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      if (now >= endTime) {
        setCount(end);
        return;
      }

      const progress = (now - startTime) / (endTime - startTime);
      // Ease-out cubic for natural feel
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easedProgress * end);
      setCount(currentValue);

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, delay, isInView, prefersReducedMotion]);

  // Format number with Brazilian locale
  const formattedValue = count.toLocaleString('pt-BR');

  return (
    <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-none tracking-tight">
      <span className="text-base sm:text-lg lg:text-xl font-normal text-amber-600">
        {prefix}
      </span>
      {formattedValue}
      <span className="text-base sm:text-lg lg:text-xl font-normal text-amber-600">
        {suffix}
      </span>
    </div>
  );
}