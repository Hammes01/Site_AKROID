import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface PostCategory {
  name: string
}

interface Post {
  id: string
  title: string
  status: string
  published_at: string | null
  post_categories: PostCategory[]
}

export default async function PostsPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, status, published_at, post_categories(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link
          href="/admin/posts/novo"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          + Novo post
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts?.length ? (
              posts.map((post: Post) => (
                <tr key={post.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{post.title}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {post.post_categories?.[0]?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        post.status === 'published'
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-slate-400 hover:text-white"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Nenhum post cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}