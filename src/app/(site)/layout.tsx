import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const NAV_LINKS = [
  { label: 'Início', href: '/' },
  { label: 'Soluções', href: '/#solucoes' },
  { label: 'Projetos', href: '/projetos' },
  { label: 'Kits', href: '/kits' },
  { label: 'Conteúdos', href: '/blog' },
  { label: 'Contato', href: '/contato' },
]

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('trade_name, legal_name, document')
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {org?.trade_name ?? 'AKROID'}
          </Link>

          <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/contato"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Solicitar orçamento
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500">
          <p className="font-medium text-slate-700">
            {org?.trade_name ?? 'AKROID Energia Solar'}
          </p>
          <p className="mt-1">
            Operado por {org?.legal_name ?? 'Hermon Serviços e Importação LTDA.'}
            {org?.document ? ` — CNPJ ${org.document}` : ''}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            © {new Date().getFullYear()} {org?.trade_name ?? 'AKROID'}. Todos
            os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}