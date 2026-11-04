import Link from 'next/link'
import { PRIVACY_POLICY_PUBLISHED } from '@/lib/privacy'
import { createPublicClient } from '@/lib/supabase/public'
import { parseSalesConfig } from '@/lib/sales-config'
import Analytics from './components/Analytics'
import SiteHeader from './components/SiteHeader'
import WhatsAppButton from './components/WhatsAppButton'

// Páginas sem dados por visitante (home, contato, privacidade) ficam em cache e se
// refazem no máximo a cada 5 minutos. Salvar no admin atualiza na hora (revalidatePath).
// As demais leem cookies e continuam sendo montadas a cada visita.
export const revalidate = 300

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createPublicClient()
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
  const contacts = [sales.contactPhone, sales.contactEmail, sales.contactAddress].filter(Boolean)

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader />

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
          {contacts.length > 0 && <p className="mt-3">{contacts.join(' · ')}</p>}
          {PRIVACY_POLICY_PUBLISHED && (
            <p className="mt-3">
              <Link href="/privacidade" className="underline hover:text-brand-700">
                Política de privacidade
              </Link>
            </p>
          )}
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