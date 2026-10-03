'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  Search,
  FileText,
  CheckCircle2,
  Hammer,
  Home,
  ArrowRight,
} from 'lucide-react';

interface ProcessStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const processSteps: ProcessStep[] = [
  {
    id: 'analise',
    number: 1,
    title: 'Análise',
    description: 'Avaliamos seu consumo, perfil de uso e características do imóvel para dimensionar o sistema ideal.',
    icon: Search,
    color: 'blue',
  },
  {
    id: 'projeto',
    number: 2,
    title: 'Projeto',
    description: 'Engenharia própria desenvolve projeto executivo, memorial de cálculo, unifilar e ART para aprovação.',
    icon: FileText,
    color: 'amber',
  },
  {
    id: 'homologacao',
    number: 3,
    title: 'Homologação',
    description: 'Protocolamos o projeto na concessionária, acompanhamos a análise e garantimos a aprovação sem burocracia para você.',
    icon: CheckCircle2,
    color: 'green',
  },
  {
    id: 'instalacao',
    number: 4,
    title: 'Instalação',
    description: 'Equipes certificadas instalam com materiais premium, seguindo normas técnicas e cronograma acordado.',
    icon: Hammer,
    color: 'purple',
  },
  {
    id: 'entrega',
    number: 5,
    title: 'Entrega',
    description: 'Comissionamento, configuração do monitoramento, treinamento do cliente e entrega de toda documentação.',
    icon: Home,
    color: 'orange',
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; line: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-200', line: 'bg-blue-500' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-200', line: 'bg-amber-500' },
  green: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-200', line: 'bg-green-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-200', line: 'bg-purple-500' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-200', line: 'bg-orange-500' },
};

export default function Process() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section
      ref={ref}
      id="processo"
      className="py-16 sm:py-20 lg:py-24 bg-white"
      aria-labelledby="process-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2
            id="process-heading"
            className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight"
          >
            Nosso
            <br />
            <span className="text-amber-600">processo</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Da primeira análise à energização, cuidamos de tudo com transparência
            e excelência técnica. Você acompanha cada etapa.
          </p>
        </motion.div>

        {/* Process timeline */}
        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Vertical connecting line - Mobile */}
          <div className="lg:hidden absolute left-8 top-0 bottom-0 w-px bg-linear-to-b from-amber-500 to-slate-200" aria-hidden="true" />

          {/* Horizontal connecting line - Desktop */}
          <div className="hidden lg:absolute lg:top-15 lg:left-20 lg:right-20 lg:h-px lg:bg-linear-to-r lg:from-amber-500 lg:via-amber-500 lg:to-slate-200" aria-hidden="true" />

          <div className="relative lg:flex lg:items-start lg:justify-between">
            {processSteps.map((step, index) => {
              const colors = colorClasses[step.color];
              const isLast = index === processSteps.length - 1;

              return (
                <motion.article
                  key={step.id}
                  variants={itemVariants}
                  className={`relative flex flex-col items-center lg:items-start w-full lg:w-[18%] ${isLast ? '' : 'mb-12 lg:mb-0'}`}
                >
                  {/* Step number circle */}
                  <motion.div
                    className={`relative shrink-0 w-16 h-16 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center z-10 ${colors.line}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.15 + 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
                    style={{ display: prefersReducedMotion ? 'block' : 'flex' }}
                  >
                    <span className={`text-2xl font-bold ${colors.text}`}>
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Arrow between steps - Desktop only */}
                  {!isLast && (
                    <motion.div
                      className="hidden lg:block absolute top-15 left-20 right-20 h-px bg-linear-to-r from-amber-500 to-slate-200 -z-10"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.15 + 0.4, duration: 0.5 }}
                      style={{ transformOrigin: 'left center' }}
                    />
                  )}

                  {/* Content */}
                  <div className="mt-6 text-center lg:text-left w-full">
                    {/* Icon */}
                    <motion.div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} ${colors.text} mb-4`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
                    >
                      <step.icon className="h-6 w-6" aria-hidden="true" />
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                      className="text-lg font-semibold text-slate-900 mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.4, duration: 0.4 }}
                    >
                      {step.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      className="text-sm text-slate-600 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.5, duration: 0.4 }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-16 lg:mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-lg text-slate-600 mb-4">
            Pronto para começar? Faça uma simulação sem compromisso.
          </p>
          <a
            href="/contato"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Solicitar orçamento
            <motion.span
              className="inline-block transition-transform group-hover:translate-x-1"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: prefersReducedMotion ? 'none' : 'inline-block' }}
            >
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}