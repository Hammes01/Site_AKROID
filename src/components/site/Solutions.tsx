'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  Sun,
  Cpu,
  Hammer,
  FileText,
  Zap,
} from 'lucide-react';

interface Solution {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const solutions: Solution[] = [
  {
    id: 'energia-solar',
    title: 'Energia Solar',
    description: 'Projetos fotovoltaicos completos para residências, comércios e indústrias. Dimensionamento preciso para máxima economia.',
    icon: Sun,
  },
  {
    id: 'engenharia',
    title: 'Engenharia',
    description: 'Equipe própria de engenheiros especializados. ART, laudos técnicos, aprovações em concessionárias e homologações.',
    icon: Cpu,
  },
  {
    id: 'instalacao',
    title: 'Instalação',
    description: 'Instalação certificada com materiais de primeira linha. Equipes treinadas, segurança do trabalho e cronograma cumprido.',
    icon: Hammer,
  },
  {
    id: 'projetos',
    title: 'Projetos',
    description: 'Desenvolvimento de projetos executivos, unifilares, memorial de cálculo e documentação completa para aprovação.',
    icon: FileText,
  },
  {
    id: 'solucoes-eletricas',
    title: 'Soluções Elétricas',
    description: 'Adequação de entrada de energia, quadros de distribuição, SPDA, aterramento e infraestrutura para carregadores veiculares.',
    icon: Zap,
  },
];

export default function Solutions() {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <section
      ref={ref}
      id="solucoes"
      className="py-16 sm:py-20 lg:py-24 bg-slate-50"
      aria-labelledby="solutions-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2
            id="solutions-heading"
            className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight"
          >
            Nossas
            <br />
            <span className="text-amber-600">soluções</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Da engenharia à instalação, entregamos energia solar completa com
            responsabilidade técnica e suporte em todas as etapas.
          </p>
        </motion.div>

        {/* Solutions grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {solutions.map((solution) => (
            <motion.article
              key={solution.id}
              variants={itemVariants}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500"
              whileHover={{ y: -8 }}
            >
              {/* Icon wrapper */}
              <motion.div
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-500/10 text-amber-600 mb-6 transition-colors group-hover:bg-amber-500 group-hover:text-white"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <solution.icon className="h-7 w-7" aria-hidden="true" />
              </motion.div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {solution.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {solution.description}
              </p>

              {/* Decorative bottom accent */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-amber-500 transition-all duration-500 group-hover:w-full"
                aria-hidden="true"
              />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}