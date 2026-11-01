'use server'

import { sendLeadNotification } from '@/lib/lead-notification'
import { createClient } from '@/lib/supabase/server'

function parseBill(value: FormDataEntryValue | null) {
  const bill = Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(bill) && bill > 0 && bill < 100_000_000 ? bill : null
}

export async function submitLead(formData: FormData) {
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single()

  const lead = {
    name: formData.get('name') as string,
    whatsapp: formData.get('whatsapp') as string,
    city: formData.get('city') as string,
    project_type: (formData.get('project_type') as string) || null,
    monthly_bill: parseBill(formData.get('monthly_bill')),
    kit_interest: String(formData.get('kit_interest') ?? '').slice(0, 200) || null,
    source: formData.get('source') === 'simulador' ? 'simulador' : 'site',
  }

  const { error } = await supabase
    .from('leads')
    .insert({ organization_id: org?.id, ...lead })

  if (error) {
    console.error('Falha ao salvar lead:', error.message)
    return { success: false, message: 'Não foi possível enviar. Tente novamente.' }
  }

  await sendLeadNotification({
    name: lead.name,
    whatsapp: lead.whatsapp,
    city: lead.city,
    projectType: lead.project_type,
    monthlyBill: lead.monthly_bill,
    kitInterest: lead.kit_interest,
    source: lead.source,
  })

  return { success: true, message: 'Recebemos seu pedido! Em breve entraremos em contato.' }
}