import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { buildLeadEmail, sendLeadNotification } from './lead-notification.ts'

const lead = { name: 'Maria', whatsapp: '(66) 99999-9999', source: 'site' }

describe('buildLeadEmail', () => {
  it('mostra só os campos preenchidos', () => {
    const { subject, text } = buildLeadEmail(lead)
    assert.equal(subject, 'Novo pedido de orçamento: Maria')
    assert.equal(text, 'Nome: Maria\nWhatsApp: (66) 99999-9999\nOrigem: site')
  })

  it('inclui conta de luz e kit quando existem', () => {
    const { text } = buildLeadEmail({ ...lead, monthlyBill: 1190.5, kitInterest: 'kit 8kWp' })
    assert.match(text, /Conta de luz: R\$ 1\.190,5/)
    assert.match(text, /Kit de interesse: kit 8kWp/)
  })
})

describe('sendLeadNotification', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    process.env.RESEND_API_KEY = 'chave-de-teste'
    process.env.LEAD_NOTIFY_EMAIL = 'vendas@example.com'
    mock.method(console, 'error', () => {})
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    delete process.env.RESEND_API_KEY
    delete process.env.LEAD_NOTIFY_EMAIL
    mock.restoreAll()
  })

  it('não chama o serviço sem as variáveis de ambiente', async () => {
    delete process.env.RESEND_API_KEY
    const fake = mock.fn(async () => new Response('{}'))
    globalThis.fetch = fake
    await sendLeadNotification(lead)
    assert.equal(fake.mock.callCount(), 0)
  })

  it('envia para o e-mail configurado', async () => {
    let requestUrl = ''
    let requestBody = ''
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      requestUrl = url
      requestBody = String(init.body)
      return new Response('{}')
    }) as unknown as typeof fetch
    await sendLeadNotification(lead)
    const body = JSON.parse(requestBody)
    assert.equal(requestUrl, 'https://api.resend.com/emails')
    assert.equal(body.to, 'vendas@example.com')
    assert.equal(body.subject, 'Novo pedido de orçamento: Maria')
  })

  it('não lança erro se o serviço estiver fora do ar', async () => {
    globalThis.fetch = (async () => {
      throw new Error('fora do ar')
    }) as typeof fetch
    await assert.doesNotReject(sendLeadNotification(lead))
  })

  it('não lança erro se o serviço recusar o envio', async () => {
    globalThis.fetch = (async () => new Response('negado', { status: 403 })) as typeof fetch
    await assert.doesNotReject(sendLeadNotification(lead))
  })
})
