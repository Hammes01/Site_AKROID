import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://akroid.com.br'

  const [{ data: kits }, { data: projects }, { data: posts }] = await Promise.all([
    supabase.from('kits').select('slug').eq('status', 'published'),
    supabase.from('projects').select('slug').eq('status', 'published'),
    supabase.from('posts').select('slug').eq('status', 'published'),
  ])

  const staticRoutes = ['', '/kits', '/projetos', '/contato', '/blog'].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
    })
  )

  const kitRoutes = (kits ?? []).map((k) => ({
    url: `${baseUrl}/kits/${k.slug}`,
    lastModified: new Date(),
  }))

  const projectRoutes = (projects ?? []).map((p) => ({
    url: `${baseUrl}/projetos/${p.slug}`,
    lastModified: new Date(),
  }))

  const postRoutes = (posts ?? []).map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(),
  }))

  return [...staticRoutes, ...kitRoutes, ...projectRoutes, ...postRoutes]
}