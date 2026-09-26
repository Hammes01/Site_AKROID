'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitLead(formData: FormData) {
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single()

  const { error } = await supabase.from('leads').insert({
    organization_id: org?.id,
    name: formData.get('name') as string,
    whatsapp: formData.get('whatsapp') as string,
    city: formData.get('city') as string,
    project_type: (formData.get('project_type') as string) || null,
    source: 'site',
  })

  if (error) {
    return { success: false, message: 'Não foi possível enviar. Tente novamente.' }
  }

  return { success: true, message: 'Recebemos seu pedido! Em breve entraremos em contato.' }
}