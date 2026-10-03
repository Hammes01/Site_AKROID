'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';

interface Kit {
  id: string;
  slug: string;
  name: string;
  powerKwp: number;
  category: 'Residencial' | 'Comercial' | 'Industrial';
  imageUrl: string;
  imageAlt: string;
  price?: number;
  showPrice: boolean;
}

const featuredKits: Kit[] = [
  {
    id: '1',
    slug: 'kit-residencial-5kwp',
    name: 'Kit Residencial 5 kWp',
    powerKwp: 5,
    category: 'Residencial',
    imageUrl: '/images/kits/kit-5kwp.jpg',
    imageAlt: 'Kit solar residencial 5 kWp',
    price: 28900,
    showPrice: true,
  },
  {
    id: '2',
    slug: 'kit-residencial-8kwp',
    name: 'Kit Residencial 8 kWp',
    powerKwp: 8,
    category: 'Residencial',
    imageUrl: '/images/kits/kit-8kwp.jpg',
    imageAlt: 'Kit solar residencial 8 kWp',
    price: 42500,
    showPrice: true,
  },
  {
    id: '3',
    slug: 'kit-comercial-15kwp',
    name: 'Kit Comercial 15 kWp',
    powerKwp: 15,
    category: 'Comercial',
    imageUrl: '/images/kits/kit-15kwp.jpg',
    imageAlt: 'Kit solar comercial 15 kWp',
    price: 72000,
    showPrice: true,
  },
];

const categoryColors: Record<Kit['category'], string> = {
  Residencial: 'bg-blue-500/10 text-blue-700 border-blue-200',
  Comercial: 'bg-amber-500/10 text-amber-700 border-amber-200',
  Industrial: 'bg-purple-500/10 text-purple-700 border-purple-200',
};

export default function FeaturedKits() {
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
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <section
      ref={ref}
      id="kits-destaque"
      className="py-16 sm:py-20 lg:py-24 bg-white"
      aria-labelledby="kits-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
        >
          <div>
            <h2
              id="kits-heading"
              className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight"
            >
              Kits em destaque
            </h2>
            <p className="mt-2 text-lg text-slate-600 max-w-xl">
              Kits fotovoltaicos completos, dimensionados para máxima performance
              e economia. Escolha o ideal para seu consumo.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              href="/kits"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Ver todos os kits
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: prefersReducedMotion ? 'none' : 'inline-block' }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Kits grid - Desktop */}
        <motion.div
          className="hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {featuredKits.map((kit) => (
            <motion.article
              key={kit.id}
              variants={itemVariants}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
              whileHover={{ y: -8 }}
            >
              {/* Image */}
              <div className="relative aspect-4/3 overflow-hidden">
                <div className="absolute inset-0 bg-slate-100" aria-hidden="true" />
                <Image
                  src={kit.imageUrl}
                  alt={kit.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[kit.category]}`}
                  >
                    {kit.category}
                  </span>
                </div>
                {/* Power badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-slate-900 border border-white/50 shadow-sm">
                    {kit.powerKwp} kWp
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {kit.name}
                </h3>

                {/* Price */}
                {kit.showPrice && kit.price && (
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    A partir de R$ {kit.price.toLocaleString('pt-BR')}
                  </p>
                )}

                {/* Link to kit detail */}
                <Link
                  href={`/kits/${kit.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors group"
                >
                  Ver detalhes do kit
                  <motion.span
                    className="transition-transform group-hover:translate-x-1"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ display: prefersReducedMotion ? 'none' : 'inline-block' }}
                  >
                    →
                  </motion.span>
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Kits carousel - Mobile */}
        <motion.div
          className="lg:hidden"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
            {featuredKits.map((kit) => (
              <motion.article
                key={kit.id}
                variants={itemVariants}
                className="group relative shrink-0 w-70 sm:w-[320px] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm snap-center"
                whileHover={{ y: -4 }}
              >
                {/* Image */}
                <div className="relative aspect-4/3 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-100" aria-hidden="true" />
                  <Image
                    src={kit.imageUrl}
                    alt={kit.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="280px"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                  />
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors[kit.category]}`}
                    >
                      {kit.category}
                    </span>
                  </div>
                  {/* Power badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-slate-900 border border-white/50 shadow-sm">
                      {kit.powerKwp} kWp
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {kit.name}
                  </h3>

                  {/* Price */}
                  {kit.showPrice && kit.price && (
                    <p className="mt-2 text-base font-bold text-slate-900">
                      A partir de R$ {kit.price.toLocaleString('pt-BR')}
                    </p>
                  )}

                  {/* Link to kit detail */}
                  <Link
                    href={`/kits/${kit.slug}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors group"
                  >
                    Ver detalhes
                    <motion.span
                      className="transition-transform group-hover:translate-x-1"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ display: prefersReducedMotion ? 'none' : 'inline-block' }}
                    >
                      →
                    </motion.span>
                  </Link>
                </div>
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
            Arraste para ver mais kits →
          </motion.p>
        </motion.div>

        {/* Empty state fallback */}
        {featuredKits.length === 0 && (
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">Nenhum kit em destaque</h3>
            <p className="mt-2 text-slate-500">Cadastre kits na área administrativa para exibi-los aqui.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}