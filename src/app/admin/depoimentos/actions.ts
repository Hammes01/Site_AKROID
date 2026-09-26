'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createTestimonial(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single()

  const { error } = await supabase.from('testimonials').insert({
    organization_id: org?.id,
    client_name: formData.get('client_name') as string,
    client_company: formData.get('client_company') as string,
    city: formData.get('city') as string,
    role: formData.get('role') as string,
    content: formData.get('content') as string,
    video_url: formData.get('video_url') as string,
    rating: formData.get('rating') ? Number(formData.get('rating')) : null,
    is_published: formData.get('is_published') === 'on',
    created_by: user?.id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/depoimentos')
  redirect('/admin/depoimentos')
}

export async function updateTestimonial(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('testimonials')
    .update({
      client_name: formData.get('client_name') as string,
      client_company: formData.get('client_company') as string,
      city: formData.get('city') as string,
      role: formData.get('role') as string,
      content: formData.get('content') as string,
      video_url: formData.get('video_url') as string,
      rating: formData.get('rating') ? Number(formData.get('rating')) : null,
      is_published: formData.get('is_published') === 'on',
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/depoimentos')
  redirect('/admin/depoimentos')
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('testimonials').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/depoimentos')
  redirect('/admin/depoimentos')
}