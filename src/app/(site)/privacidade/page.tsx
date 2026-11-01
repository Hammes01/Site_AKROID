import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PRIVACY_POLICY_PUBLISHED } from '@/lib/privacy'

// RASCUNHO PENDENTE DE REVISÃO JURÍDICA. Esta página responde 404 enquanto
// PRIVACY_POLICY_PUBLISHED for false. Antes de publicar, um advogado precisa revisar
// todo o texto, e os campos [A DEFINIR] precisam ser preenchidos com dados reais.

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  robots: { index: false, follow: false },
}

const SECTIONS = [
  {
    title: 'Quem é o responsável pelos seus dados',
    body: ['Hermon Serviços e Importação LTDA., que opera a marca AKROID Energia Solar, CNPJ [A DEFINIR]. Contato do responsável: [A DEFINIR: nome e e-mail].'],
  },
  {
    title: 'Quais dados coletamos',
    body: [
      'Dados de contato: nome, WhatsApp, cidade, telefone e e-mail.',
      'Dados do consumo: valor e cópia da fatura de energia, que contém nome, endereço e número da unidade consumidora.',
      'Dados do imóvel: endereço, localização, fotos do telhado e do padrão de entrada.',
      'Documentos para financiamento: CNH e outros documentos pedidos pelos bancos, somente quando você solicita a simulação.',
      'Dados de navegação: com o seu aceite no aviso de cookies, usamos Google Analytics e Pixel da Meta para entender o uso do site e medir anúncios.',
    ],
  },
  {
    title: 'Para que usamos',
    body: [
      'Preparar o orçamento e a proposta.',
      'Elaborar o projeto e pedir a aprovação junto à distribuidora de energia.',
      'Simular e encaminhar o financiamento, com a sua autorização.',
      'Emitir nota fiscal, comprar o material e executar a instalação.',
      'Entrar em contato sobre o seu pedido e medir o desempenho do site e dos anúncios.',
    ],
  },
  {
    title: 'Com quem compartilhamos',
    body: [
      'Distribuidora de energia, para a aprovação e a vistoria do sistema.',
      'Bancos e instituições financeiras, somente com a sua autorização.',
      'Fornecedores e prestadores necessários ao projeto, à compra e à instalação.',
      'Provedores de tecnologia que hospedam o site e os dados, e Google e Meta quando você aceita os cookies.',
      'Autoridades públicas, quando a lei exigir.',
    ],
  },
  {
    title: 'Por quanto tempo guardamos',
    body: ['[A DEFINIR com o advogado: prazo de guarda para contatos que não viraram clientes, para contratos e notas fiscais, e para documentos de financiamento.]'],
  },
  {
    title: 'Como protegemos',
    body: ['O acesso ao painel administrativo exige login e é limitado por permissões. [A DEFINIR: descrever as medidas usadas para guardar faturas e documentos recebidos fora do site, como pelo WhatsApp.]'],
  },
  {
    title: 'Seus direitos',
    body: ['Você pode pedir a confirmação de que tratamos seus dados, o acesso, a correção, a exclusão, a portabilidade e informações sobre o compartilhamento, além de revogar o consentimento. Para isso, use o contato do responsável indicado acima.'],
  },
]

export default function PrivacidadePage() {
  if (!PRIVACY_POLICY_PUBLISHED) notFound()

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">Política de Privacidade</h1>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
            <ul className="mt-3 space-y-2 text-slate-600">
              {section.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
