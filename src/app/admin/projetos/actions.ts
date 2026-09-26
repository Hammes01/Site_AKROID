'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string
) {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  let slug = baseSlug
  let attempt = 1
  while (true) {
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!existing) break
    attempt += 1
    slug = `${baseSlug}-${attempt}`
  }

  return slug
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const title = formData.get('title') as string
  const slug = await generateUniqueSlug(supabase, title)

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single()

  const { error } = await supabase.from('projects').insert({
    organization_id: org?.id,
    title,
    slug,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    power_installed_kwp: formData.get('power_installed_kwp')
      ? Number(formData.get('power_installed_kwp'))
      : null,
    project_type: (formData.get('project_type') as string) || null,
    module_count: formData.get('module_count')
      ? Number(formData.get('module_count'))
      : null,
    inverter_brand: formData.get('inverter_brand') as string,
    client_name: formData.get('client_name') as string,
    description: formData.get('description') as string,
    video_url: formData.get('video_url') as string,
    status: formData.get('status') as string,
    is_featured: formData.get('is_featured') === 'on',
    created_by: user?.id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/projetos')
  redirect('/admin/projetos')
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({
      title: formData.get('title') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      power_installed_kwp: formData.get('power_installed_kwp')
        ? Number(formData.get('power_installed_kwp'))
        : null,
      project_type: (formData.get('project_type') as string) || null,
      module_count: formData.get('module_count')
        ? Number(formData.get('module_count'))
        : null,
      inverter_brand: formData.get('inverter_brand') as string,
      client_name: formData.get('client_name') as string,
      description: formData.get('description') as string,
      video_url: formData.get('video_url') as string,
      status: formData.get('status') as string,
      is_featured: formData.get('is_featured') === 'on',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/projetos')
  redirect('/admin/projetos')
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/projetos')
  redirect('/admin/projetos')
}