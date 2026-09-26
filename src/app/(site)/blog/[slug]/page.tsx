import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

interface PostCategory {
  name: string
}

interface Post {
  id: string
  title: string
  excerpt: string | null
  content: string
  slug: string
  published_at: string | null
  tags: string[] | null
  post_categories: PostCategory[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return { title: 'Post não encontrado' }
  }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
    },
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*, post_categories(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    notFound()
  }

  const typedPost = post as Post

  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      {typedPost.post_categories?.[0]?.name && (
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {typedPost.post_categories[0].name}
        </p>
      )}
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">
        {post.title}
      </h1>
      {post.published_at && (
        <p className="mt-2 text-sm text-slate-400">
          {new Date(post.published_at).toLocaleDateString('pt-BR')}
        </p>
      )}

      <div className="mt-8 whitespace-pre-wrap text-slate-700 leading-relaxed">
        {post.content}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}