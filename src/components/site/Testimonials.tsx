'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  content: string;
  clientName: string;
  city: string;
  state: string;
  rating: number;
  imageUrl?: string;
  imageAlt?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    content: 'A equipe da Akroid foi impecável do início ao fim. O projeto foi entregue no prazo, a instalação ficou limpa e organizada, e a economia na conta de luz já apareceu no primeiro mês. Recomendo de olhos fechados.',
    clientName: 'Roberto Silva',
    city: 'Campinas',
    state: 'SP',
    rating: 5,
    imageUrl: '/images/testimonials/roberto.jpg',
    imageAlt: 'Roberto Silva - Cliente Akroid',
  },
  {
    id: '2',
    content: 'Contratamos a Akroid para a usina da nossa fábrica. O dimensionamento foi preciso, a documentação para homologação na CPFL foi toda feita por eles e a energização ocorreu sem problemas. Engenharia séria.',
    clientName: 'Marcos Andrade',
    city: 'Ribeirão Preto',
    state: 'SP',
    rating: 5,
    imageUrl: '/images/testimonials/marcos.jpg',
    imageAlt: 'Marcos Andrade - Cliente Akroid',
  },
  {
    id: '3',
    content: 'O que mais me impressionou foi a transparência. Explicaram cada item do orçamento, não teve surpresa no final. A instalação durou 3 dias, equipe uniformizada, uso de EPIs, tudo muito profissional.',
    clientName: 'Fernanda Costa',
    city: 'São José dos Campos',
    state: 'SP',
    rating: 5,
    imageUrl: '/images/testimonials/fernanda.jpg',
    imageAlt: 'Fernanda Costa - Cliente Akroid',
  },
  {
    id: '4',
    content: 'Já faz 2 anos que instalamos e o sistema roda perfeito. O monitoramento pelo app funciona bem, a geração bate com o projetado. Quando precisei de suporte, me atenderam no mesmo dia.',
    clientName: 'Carlos Eduardo',
    city: 'Jundiaí',
    state: 'SP',
    rating: 5,
    imageUrl: '/images/testimonials/carlos.jpg',
    imageAlt: 'Carlos Eduardo - Cliente Akroid',
  },
  {
    id: '5',
    content: 'Fizemos a ampliação do sistema este ano e a Akroid cuidou de tudo: novo projeto, nova ART, homologação da ampliação. Mesmo processo tranquilo da primeira vez. Parceria de longo prazo.',
    clientName: 'Patrícia Lima',
    city: 'Sorocaba',
    state: 'SP',
    rating: 5,
    imageUrl: '/images/testimonials/patricia.jpg',
    imageAlt: 'Patrícia Lima - Cliente Akroid',
  },
  {
    id: '6',
    content: 'Indiquei para meu pai e meu irmão. Os três sistemas funcionando perfeitos. O diferencial é a engenharia própria: eles assumem a responsabilidade técnica, não terceirizam a parte mais importante.',
    clientName: 'Ricardo Mendes',
    city: 'Piracicaba',
    state: 'SP',
    rating: 5,
    imageUrl: '/images/testimonials/ricardo.jpg',
    imageAlt: 'Ricardo Mendes - Cliente Akroid',
  },
];

export default function Testimonials() {
  const prefersReducedMotion = useReducedMotion() ?? false;
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

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );

  return (
    <section
      ref={ref}
      id="depoimentos"
      className="py-16 sm:py-20 lg:py-24 bg-slate-50"
      aria-labelledby="testimonials-heading"
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
            id="testimonials-heading"
            className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight"
          >
            O que nossos
            <br />
            <span className="text-amber-600">clientes dizem</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Histórias reais de quem confiou na Akroid para gerar a própria energia.
          </p>
        </motion.div>

        {/* Testimonials grid - Desktop */}
        <motion.div
          className="hidden lg:grid lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {testimonials.map((testimonial) => (
            <motion.article
              key={testimonial.id}
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500"
            >
              {/* Rating */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                {renderStars(testimonial.rating)}
              </motion.div>

              {/* Content */}
              <motion.blockquote
                className="text-slate-600 leading-relaxed mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                &ldquo;{testimonial.content}&rdquo;
              </motion.blockquote>

              {/* Client info */}
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {testimonial.imageUrl ? (
                  <Image
                    src={testimonial.imageUrl}
                    alt={testimonial.imageAlt || ''}
                    width={48}
                    height={48}
                    className="rounded-full object-cover ring-2 ring-amber-500/20"
                  />
                ) : (
                  <div className="shrink-0 w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center ring-2 ring-amber-500/20">
                    <span className="text-lg font-semibold text-amber-600">
                      {testimonial.clientName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-900">{testimonial.clientName}</p>
                  <p className="text-sm text-slate-500">{testimonial.city}/{testimonial.state}</p>
                </div>
              </motion.div>

              {/* Decorative bottom accent */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-amber-500 transition-all duration-500 group-hover:w-full"
                aria-hidden="true"
              />
            </motion.article>
          ))}
        </motion.div>

        {/* Testimonials carousel - Mobile */}
        <motion.div
          className="lg:hidden"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
            {testimonials.map((testimonial) => (
              <motion.article
                key={testimonial.id}
                variants={itemVariants}
                className="group relative shrink-0 w-70 sm:w-[320px] bg-white rounded-2xl p-6 border border-slate-100 shadow-sm snap-center"
              >
                {/* Rating */}
                <div className="mb-3">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Content */}
                <blockquote className="text-sm text-slate-600 leading-relaxed mb-5">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>

                {/* Client info */}
                <div className="flex items-center gap-3">
                  {testimonial.imageUrl ? (
                    <Image
                      src={testimonial.imageUrl}
                      alt={testimonial.imageAlt || ''}
                      width={40}
                      height={40}
                      className="rounded-full object-cover ring-2 ring-amber-500/20"
                    />
                  ) : (
                    <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center ring-2 ring-amber-500/20">
                      <span className="text-base font-semibold text-amber-600">
                        {testimonial.clientName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{testimonial.clientName}</p>
                    <p className="text-xs text-slate-500">{testimonial.city}/{testimonial.state}</p>
                  </div>
                </div>

                {/* Decorative bottom accent */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-amber-500 transition-all duration-500 group-hover:w-full"
                  aria-hidden="true"
                />
              </motion.article>
            ))}
          </div>

          {/* Scroll indicator for mobile */}
          <motion.p
            className="text-center text-sm text-slate-500 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ display: prefersReducedMotion ? 'none' : 'block' }}
          >
            Arraste para ver mais depoimentos →
          </motion.p>
        </motion.div>

        {/* Empty state fallback */}
        {testimonials.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg
              className="mx-auto h-16 w-16 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">Nenhum depoimento disponível</h3>
            <p className="mt-2 text-slate-500">Cadastre depoimentos na área administrativa para exibi-los aqui.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}