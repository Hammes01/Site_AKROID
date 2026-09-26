'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string
) {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  let slug = baseSlug
  let attempt = 1
  while (true) {
    const { data: existing } = await supabase
      .from('kits')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!existing) break
    attempt += 1
    slug = `${baseSlug}-${attempt}`
  }

  return slug
}

export async function createKit(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name = formData.get('name') as string
  const slug = await generateUniqueSlug(supabase, name)

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single()

  const showPrice = formData.get('show_price') === 'on'
  const priceRaw = formData.get('price') as string

  const { error } = await supabase.from('kits').insert({
    organization_id: org?.id,
    name,
    slug,
    description: formData.get('description') as string,
    power_kwp: formData.get('power_kwp')
      ? Number(formData.get('power_kwp'))
      : null,
    category: (formData.get('category') as string) || null,
    price: priceRaw ? Number(priceRaw) : null,
    show_price: showPrice,
    status: formData.get('status') as string,
    is_featured: formData.get('is_featured') === 'on',
    created_by: user?.id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/kits')
  redirect('/admin/kits')
}

export async function updateKit(id: string, formData: FormData) {
  const supabase = await createClient()

  const showPrice = formData.get('show_price') === 'on'
  const priceRaw = formData.get('price') as string

  const { error } = await supabase
    .from('kits')
    .update({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      power_kwp: formData.get('power_kwp')
        ? Number(formData.get('power_kwp'))
        : null,
      category: (formData.get('category') as string) || null,
      price: priceRaw ? Number(priceRaw) : null,
      show_price: showPrice,
      status: formData.get('status') as string,
      is_featured: formData.get('is_featured') === 'on',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/kits')
  redirect('/admin/kits')
}

export async function deleteKit(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('kits').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/kits')
  redirect('/admin/kits')
}