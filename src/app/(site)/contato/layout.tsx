import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solicite um Orçamento',
  description:
    'Preencha o formulário e receba uma proposta personalizada de energia solar para sua residência, comércio ou indústria.',
}

export default function ContatoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}