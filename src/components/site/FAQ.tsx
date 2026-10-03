'use client';

import React, { useState } from 'react';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sun, Zap, Shield, Clock, Wrench, CheckCircle2 } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
}

const faqItems: FAQItem[] = [
  {
    id: 'economia',
    question: 'Qual a economia real na conta de luz?',
    answer: 'A economia varia entre 70% e 95% do valor da fatura, dependendo do seu perfil de consumo, tarifa da concessionária e dimensionamento do sistema. Em média, nossos clientes recuperam o investimento em 3 a 5 anos e têm 20+ anos de energia praticamente gratuita.',
    icon: Sun,
  },
  {
    id: 'tempo-instalacao',
    question: 'Quanto tempo leva a instalação completa?',
    answer: 'Para sistemas residenciais (até 10 kWp), a instalação física leva 2 a 4 dias. O processo completo — da assinatura do contrato à energização — costuma levar 30 a 60 dias, incluindo projeto, homologação na concessionária e agendamento da vistoria.',
    icon: Clock,
  },
  {
    id: 'garantia',
    question: 'Quais são as garantias dos equipamentos e da instalação?',
    answer: 'Módulos: 25 anos de performance linear (80%+ no ano 25) e 12-15 anos de produto. Inversores: 5 a 10 anos (extensíveis). Estruturas: 10 a 25 anos. Instalação: 5 anos de garantia Akroid (ART do engenheiro responsável). Todos os equipamentos são de fabricantes Tier 1.',
    icon: Shield,
  },
  {
    id: 'manutencao',
    question: 'Precisa de manutenção? Como funciona?',
    answer: 'Sistemas fotovoltaicos exigem pouca manutenção. Recomendamos limpeza dos módulos 1-2 vezes ao ano (conforme poeira/poluição) e inspeção técnica anual. O monitoramento remoto (incluso) alerta sobre qualquer queda de performance. Oferecemos planos de manutenção preventiva.',
    icon: Wrench,
  },
  {
    id: 'chuva-noite',
    question: 'E nos dias nublados, chuvosos ou à noite?',
    answer: 'À noite o sistema não gera (usa-se a rede da concessionária). Em dias nublados/chuvosos a geração cai para 10-25% da capacidade, mas o sistema continua funcionando. O dimensionamento considera a média histórica de irradiação da sua região para garantir a economia anual projetada.',
    icon: Zap,
  },
  {
    id: 'valorizacao',
    question: 'O imóvel valoriza com o sistema solar?',
    answer: 'Sim. Estudos mostram valorização de 3% a 6% no valor do imóvel. Além disso, a isenção de ICMS na conta de luz (em muitos estados) e a proteção contra aumentos tarifários tornam o imóvel mais atrativo para venda ou locação.',
    icon: CheckCircle2,
  },
];

export default function FAQ() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      ref={ref}
      id="faq"
      className="py-16 sm:py-20 lg:py-24 bg-slate-50"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight"
          >
            Perguntas
            <br />
            <span className="text-amber-600">frequentes</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            As dúvidas mais comuns sobre energia solar fotovoltaica e nosso processo.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {faqItems.map((item, index) => (
            <motion.article
              key={item.id}
              variants={itemVariants}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${item.id}`}
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="flex-1 text-base font-medium text-slate-900 pr-4">
                  {item.question}
                </span>
                <motion.div
                  className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                  animate={{
                    rotate: openIndex === index ? 180 : 0,
                  }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                >
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${item.id}`}
                    className="px-6 pb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeInOut' }}
                  >
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-slate-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12 lg:mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-lg text-slate-600 mb-4">
            Não encontrou sua dúvida? Fale direto com nossa equipe de engenharia.
          </p>
          <a
            href="/contato"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Entrar em contato
            <motion.span
              className="inline-block transition-transform group-hover:translate-x-1"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: prefersReducedMotion ? 'none' : 'inline-block' }}
            >
              <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}