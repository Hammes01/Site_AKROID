import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

interface PostCategory {
  name: string
}

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  post_categories: PostCategory[]
}

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Conteúdos sobre energia solar, engenharia fotovoltaica e dicas para quem quer economizar na conta de luz.',
}

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image_url, published_at, post_categories(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">Blog</h1>
      <p className="mt-2 text-slate-600">
        Conteúdos sobre energia solar, engenharia e economia de energia.
      </p>

      <div className="mt-10 space-y-8">
        {posts?.length ? (
          posts.map((post: Post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block border-b border-slate-100 pb-8 last:border-0"
            >
              {post.post_categories?.[0]?.name && (
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {post.post_categories[0].name}
                </p>
              )}
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-slate-600">{post.excerpt}</p>
              )}
              {post.published_at && (
                <p className="mt-3 text-xs text-slate-400">
                  {new Date(post.published_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </Link>
          ))
        ) : (
          <p className="text-slate-500">Nenhum conteúdo publicado ainda.</p>
        )}
      </div>
    </div>
  )
}