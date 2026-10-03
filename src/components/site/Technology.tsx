'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  Shield,
  Zap,
  Sun,
  Wrench,
  CheckCircle2,
  Award,
} from 'lucide-react';

interface TechItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const techItems: TechItem[] = [
  {
    id: 'modulos-tier1',
    title: 'Módulos Tier 1',
    description: 'Apenas fabricantes Tier 1 (BloombergNEF) com garantia de 25 anos de performance linear e 12-15 anos de produto.',
    icon: Sun,
  },
  {
    id: 'inversores-premium',
    title: 'Inversores Premium',
    description: 'Trabalhamos com as melhores marcas: Fronius, Sungrow, Growatt, Deye e GoodWe. Eficiência > 98% e monitoramento nativo.',
    icon: Zap,
  },
  {
    id: 'estruturas-certificadas',
    title: 'Estruturas Certificadas',
    description: 'Estruturas em alumínio anodizado e aço inox 304/316. Cálculo estrutural por engenheiro responsável (ART) para cada projeto.',
    icon: Wrench,
  },
  {
    id: 'protecao-completa',
    title: 'Proteção Completa',
    description: 'DPS (Classe I+II), string box com fusíveis, aterramento dedicado, SPDA quando necessário. Conforme NBR 5410/5419.',
    icon: Shield,
  },
  {
    id: 'homologacao-garantida',
    title: 'Homologação Garantida',
    description: 'Projeto executivo, ART, laudos e documentação completa para aprovação na concessionária. Acompanhamos até a energização.',
    icon: CheckCircle2,
  },
  {
    id: 'qualidade-reconhecida',
    title: 'Qualidade Reconhecida',
    description: 'Processos auditados, fornecedores homologados e instalações certificadas. Compromisso com a excelência em cada detalhe.',
    icon: Award,
  },
];

export default function Technology() {
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
      },
    },
  };

  return (
    <section
      ref={ref}
      id="tecnologia"
      className="py-16 sm:py-20 lg:py-24 bg-slate-50"
      aria-labelledby="technology-heading"
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
            id="technology-heading"
            className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight"
          >
            Tecnologia &
            <br />
            <span className="text-amber-600">equipamentos de ponta</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Não abrimos mão da qualidade. Cada componente é selecionado por
            engenheiros, testado em campo e homologado para entregar performance
            e segurança por décadas.
          </p>
        </motion.div>

        {/* Tech grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {techItems.map((item) => (
            <motion.article
              key={item.id}
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
                <item.icon className="h-7 w-7" aria-hidden="true" />
              </motion.div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>

              {/* Decorative bottom accent */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-amber-500 transition-all duration-500 group-hover:w-full"
                aria-hidden="true"
              />
            </motion.article>
          ))}
        </motion.div>

        {/* Trust badges row */}
        <motion.div
          className="mt-16 lg:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="p-6 bg-white rounded-2xl border border-slate-100">
            <div className="text-3xl sm:text-4xl font-bold text-amber-600">25</div>
            <div className="mt-1 text-sm text-slate-600">Anos garantia performance</div>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100">
            <div className="text-3xl sm:text-4xl font-bold text-amber-600">98%</div>
            <div className="mt-1 text-sm text-slate-600">Eficiência inversores</div>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100">
            <div className="text-3xl sm:text-4xl font-bold text-amber-600">Tier 1</div>
            <div className="mt-1 text-sm text-slate-600">Módulos BloombergNEF</div>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100">
            <div className="text-3xl sm:text-4xl font-bold text-amber-600">NBR</div>
            <div className="mt-1 text-sm text-slate-600">5410 / 5419 / 16690</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}