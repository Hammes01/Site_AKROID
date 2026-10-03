'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
  id: string;
  slug: string;
  title: string;
  type: 'Residencial' | 'Comercial' | 'Industrial' | 'Rural';
  city: string;
  state: string;
  powerKwp: number;
  imageUrl: string;
  imageAlt: string;
}

// Mock data - replace with real data from Supabase later
const featuredProjects: Project[] = [
  {
    id: '1',
    slug: 'usina-fotovoltaica-ribeirao-preto',
    title: 'Usina Fotovoltaica Ribeirão Preto',
    type: 'Comercial',
    city: 'Ribeirão Preto',
    state: 'SP',
    powerKwp: 150,
    imageUrl: '/images/projects/ribeirao-preto.jpg',
    imageAlt: 'Usina fotovoltaica em Ribeirão Preto - SP',
  },
  {
    id: '2',
    slug: 'residencia-solar-campinas',
    title: 'Residência Solar Campinas',
    type: 'Residencial',
    city: 'Campinas',
    state: 'SP',
    powerKwp: 9.23,
    imageUrl: '/images/projects/campinas.jpg',
    imageAlt: 'Sistema residencial em Campinas - SP',
  },
  {
    id: '3',
    slug: 'industria-solar-sao-jose',
    title: 'Indústria Solar São José dos Campos',
    type: 'Industrial',
    city: 'São José dos Campos',
    state: 'SP',
    powerKwp: 450,
    imageUrl: '/images/projects/sao-jose.jpg',
    imageAlt: 'Sistema industrial em São José dos Campos - SP',
  },
];

const typeColors: Record<Project['type'], string> = {
  Residencial: 'bg-blue-500/10 text-blue-700 border-blue-200',
  Comercial: 'bg-amber-500/10 text-amber-700 border-amber-200',
  Industrial: 'bg-purple-500/10 text-purple-700 border-purple-200',
  Rural: 'bg-green-500/10 text-green-700 border-green-200',
};

export default function FeaturedProjects() {
  const prefersReducedMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      id="projetos-destaque"
      className="py-16 sm:py-20 lg:py-24 bg-white"
      aria-labelledby="featured-projects-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div>
            <h2
              id="featured-projects-heading"
              className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight"
            >
              Projetos em destaque
            </h2>
            <p className="mt-2 text-lg text-slate-600 max-w-xl">
              Instalações reais que mostram a qualidade e a engenharia por trás
              de cada projeto Akroid.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              href="/projetos"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Ver todos os projetos
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

        {/* Projects grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {featuredProjects.map((project, _index) => (
            <motion.article
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                },
              }}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
              whileHover={{ y: -8 }}
            >
              {/* Image */}
              <div className="relative aspect-4/3 overflow-hidden">
                <div className="absolute inset-0 bg-slate-100" aria-hidden="true" />
                <Image
                  src={project.imageUrl}
                  alt={project.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                />
                {/* Type badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${typeColors[project.type]}`}
                  >
                    {project.type}
                  </span>
                </div>
                {/* Power badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-slate-900 border border-white/50 shadow-sm">
                    {project.powerKwp} kWp
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{project.city}/{project.state}</span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {project.title}
                </h3>

                {/* Link to project detail */}
                <Link
                  href={`/projetos/${project.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors group"
                >
                  Ver detalhes do projeto
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

        {/* Empty state fallback */}
        {featuredProjects.length === 0 && (
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">Nenhum projeto em destaque</h3>
            <p className="mt-2 text-slate-500">Cadastre projetos na área administrativa para exibi-los aqui.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}