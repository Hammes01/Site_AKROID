import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { parseSalesConfig } from '@/lib/sales-config'
import Analytics from './components/Analytics'
import MobileMenu from './components/MobileMenu'
import WhatsAppButton from './components/WhatsAppButton'

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
  const [{ data: org }, { data: salesSetting }] = await Promise.all([
    supabase
      .from('organizations')
      .select('trade_name, legal_name, document')
      .limit(1)
      .single(),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'sales_config')
      .maybeSingle(),
  ])
  const sales = parseSalesConfig(salesSetting?.value)
  const cnpj = org?.document ?? sales.cnpj

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 h-16 border-b border-slate-100 bg-white/80 backdrop-blur md:h-18">
         <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="AKROID Energia Solar">
            <Image
              src="/logo.png"
              alt="AKROID"
              width={1024}
              height={1024}
              priority
              className="h-20 w-20 md:h-20 md:w-20 object-contain"
            />
          </Link>

          <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/contato"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-brand-700"
            >
              Solicitar orçamento
            </Link>
            <MobileMenu links={NAV_LINKS} />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-100 bg-brand-50">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 text-sm text-slate-500 md:pb-10">
          <p className="font-medium text-brand-800">
            {org?.trade_name ?? 'AKROID Energia Solar'}
          </p>
          <p className="mt-1">
            Operado por {org?.legal_name ?? 'Hermon Serviços e Importação LTDA.'}
            {cnpj ? ` — CNPJ ${cnpj}` : ''}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            © {new Date().getFullYear()} {org?.trade_name ?? 'AKROID'}. Todos
            os direitos reservados.
          </p>
        </div>
      </footer>

      {sales.whatsapp && <WhatsAppButton number={sales.whatsapp} />}
      <Analytics gaId={sales.gaId} metaPixelId={sales.metaPixelId} />
    </div>
  )
}