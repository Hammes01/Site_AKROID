import type { Metadata } from 'next'

// O formulário lê ?kit= do endereço, então a página é montada a cada visita, como antes
export const dynamic = 'force-dynamic'

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