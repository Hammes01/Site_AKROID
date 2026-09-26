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
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!existing) break
    attempt += 1
    slug = `${baseSlug}-${attempt}`
  }

  return slug
}

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const title = formData.get('title') as string
  const slug = await generateUniqueSlug(supabase, title)
  const status = formData.get('status') as string

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single()

  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw
    ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const { error } = await supabase.from('posts').insert({
    organization_id: org?.id,
    title,
    slug,
    excerpt: formData.get('excerpt') as string,
    content: formData.get('content') as string,
    tags,
    status,
    author_id: user?.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient()

  const status = formData.get('status') as string
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw
    ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const { data: current } = await supabase
    .from('posts')
    .select('published_at')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('posts')
    .update({
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      tags,
      status,
      published_at:
        status === 'published'
          ? current?.published_at ?? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}

export async function deletePost(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}