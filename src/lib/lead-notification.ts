// Avisa a empresa por e-mail quando chega um novo pedido de orçamento (via Resend).
// Sem as variáveis de ambiente, não faz nada. O lead já está salvo neste ponto,
// então uma falha aqui nunca pode impedir o visitante de concluir o pedido.

export type LeadNotification = {
  name: string
  whatsapp: string
  city?: string | null
  projectType?: string | null
  monthlyBill?: number | null
  kitInterest?: string | null
  source: string
}

export function buildLeadEmail(lead: LeadNotification) {
  const lines = [
    `Nome: ${lead.name}`,
    `WhatsApp: ${lead.whatsapp}`,
    lead.city && `Cidade: ${lead.city}`,
    lead.projectType && `Tipo: ${lead.projectType}`,
    lead.monthlyBill && `Conta de luz: R$ ${lead.monthlyBill.toLocaleString('pt-BR')}`,
    lead.kitInterest && `Kit de interesse: ${lead.kitInterest}`,
    `Origem: ${lead.source}`,
  ]

  return {
    subject: `Novo pedido de orçamento: ${lead.name}`,
    text: lines.filter(Boolean).join('\n'),
  }
}

export async function sendLeadNotification(lead: LeadNotification) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.LEAD_NOTIFY_EMAIL
  if (!apiKey || !to) return

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.LEAD_NOTIFY_FROM || 'AKROID <onboarding@resend.dev>',
        to,
        ...buildLeadEmail(lead),
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.error('Falha ao avisar novo lead:', response.status, await response.text())
    }
  } catch (error) {
    console.error('Falha ao avisar novo lead:', error)
  }
}
