'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateLeadStatus(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update({
      status: formData.get('status') as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/admin/leads/${id}`)
  revalidatePath('/admin/leads')
}

export async function addLeadNote(id: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const content = formData.get('content') as string

  if (!content?.trim()) return

  const { error } = await supabase.from('lead_notes').insert({
    lead_id: id,
    author_id: user?.id,
    content,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/admin/leads/${id}`)
}

export async function deleteLead(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('leads').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/leads')
}