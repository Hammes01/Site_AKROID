'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  videoUrl: string;
  duration: string;
  type: 'Instalação' | 'Bastidores' | 'Explicação' | 'Depoimento';
}

const videos: Video[] = [
  {
    id: '1',
    title: 'Instalação Residencial 8 kWp - Campinas/SP',
    description: 'Acompanhe o passo a passo de uma instalação residencial completa, do dimensionamento à energização.',
    thumbnailUrl: '/images/videos/instalacao-residencial.jpg',
    thumbnailAlt: 'Instalação residencial em Campinas',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    duration: '12:34',
    type: 'Instalação',
  },
  {
    id: '2',
    title: 'Usina Comercial 150 kWp - Ribeirão Preto/SP',
    description: 'Tour pela usina fotovoltaica comercial: estrutura, inversores, string boxes e comissionamento.',
    thumbnailUrl: '/images/videos/usina-comercial.jpg',
    thumbnailAlt: 'Usina comercial em Ribeirão Preto',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    duration: '8:56',
    type: 'Instalação',
  },
  {
    id: '3',
    title: 'Como dimensionar seu sistema solar',
    description: 'Nosso engenheiro explica como calcular a potência ideal para sua conta de luz e perfil de consumo.',
    thumbnailUrl: '/images/videos/dimensionamento.jpg',
    thumbnailAlt: 'Explicação sobre dimensionamento solar',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    duration: '15:22',
    type: 'Explicação',
  },
];

const typeColors: Record<Video['type'], string> = {
  Instalação: 'bg-blue-500/10 text-blue-700 border-blue-200',
  Bastidores: 'bg-purple-500/10 text-purple-700 border-purple-200',
  Explicação: 'bg-amber-500/10 text-amber-700 border-amber-200',
  Depoimento: 'bg-green-500/10 text-green-700 border-green-200',
};

export default function Videos() {
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

  return (
    <section
      ref={ref}
      id="videos"
      className="py-16 sm:py-20 lg:py-24 bg-white"
      aria-labelledby="videos-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2
              id="videos-heading"
              className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight"
            >
              Vídeos &
              <br />
              <span className="text-amber-600">conteúdo técnico</span>
            </h2>
            <p className="mt-2 text-lg text-slate-600 max-w-xl">
              Acompanhe instalações reais, bastidores de obras e explicações
              técnicas da nossa equipe de engenharia.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <a
              href="https://www.youtube.com/@akroid"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Ver canal no YouTube
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.div>
        </motion.div>

        {/* Videos grid - Desktop */}
        <motion.div
          className="hidden lg:grid lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {videos.map((video) => (
            <motion.article
              key={video.id}
              variants={itemVariants}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
              whileHover={{ y: -8 }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <div className="absolute inset-0 bg-slate-100" aria-hidden="true" />
                <Image
                  src={video.thumbnailUrl}
                  alt={video.thumbnailAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                />

                {/* Type badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[video.type]}`}
                  >
                    {video.type}
                  </span>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-3 right-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-black/80 text-white backdrop-blur-sm">
                    {video.duration}
                  </span>
                </div>

                {/* Play overlay */}
                <motion.button
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(video.videoUrl, '_blank', 'noopener,noreferrer')}
                  aria-label={`Assistir: ${video.title}`}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-slate-900 shadow-xl"
                    animate={{ scale: prefersReducedMotion ? 1 : [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ display: prefersReducedMotion ? 'none' : 'flex' }}
                  >
                    <Play className="h-7 w-7 ml-1" aria-hidden="true" />
                  </motion.div>
                  <Play className="h-7 w-7 ml-1" style={{ display: prefersReducedMotion ? 'block' : 'none' }} aria-hidden="true" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                  {video.description}
                </p>

                {/* Link to video */}
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors group"
                >
                  Assistir no YouTube
                  <motion.span
                    className="transition-transform group-hover:translate-x-1"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ display: prefersReducedMotion ? 'none' : 'inline-block' }}
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                </a>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Videos carousel - Mobile */}
        <motion.div
          className="lg:hidden"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
            {videos.map((video) => (
              <motion.article
                key={video.id}
                variants={itemVariants}
                className="group relative shrink-0 w-70 sm:w-[320px] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm snap-center"
                whileHover={{ y: -4 }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <div className="absolute inset-0 bg-slate-100" aria-hidden="true" />
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.thumbnailAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="280px"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                  />

                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${typeColors[video.type]}`}
                    >
                      {video.type}
                    </span>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/80 text-white backdrop-blur-sm">
                      {video.duration}
                    </span>
                  </div>

                  {/* Play overlay */}
                  <motion.button
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(video.videoUrl, '_blank', 'noopener,noreferrer')}
                    aria-label={`Assistir: ${video.title}`}
                  >
                    <motion.div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white text-slate-900 shadow-xl"
                      animate={{ scale: prefersReducedMotion ? 1 : [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ display: prefersReducedMotion ? 'none' : 'flex' }}
                    >
                      <Play className="h-6 w-6 ml-1" aria-hidden="true" />
                    </motion.div>
                    <Play className="h-6 w-6 ml-1" style={{ display: prefersReducedMotion ? 'block' : 'none' }} aria-hidden="true" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {video.description}
                  </p>

                  {/* Link to video */}
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors group"
                  >
                    Assistir
                    <motion.span
                      className="transition-transform group-hover:translate-x-1"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ display: prefersReducedMotion ? 'none' : 'inline-block' }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </motion.span>
                  </a>
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
            Arraste para ver mais vídeos →
          </motion.p>
        </motion.div>

        {/* Empty state fallback */}
        {videos.length === 0 && (
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">Nenhum vídeo disponível</h3>
            <p className="mt-2 text-slate-500">Cadastre vídeos na área administrativa para exibi-los aqui.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}