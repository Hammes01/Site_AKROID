import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_owner')
    .eq('id', user!.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Olá, {profile?.full_name ?? user!.email}
        </h1>
        <form action="/admin/logout" method="post">
          <button className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
            Sair
          </button>
        </form>
      </div>
      <p className="mt-2 text-slate-400">
        {profile?.is_owner
          ? 'Você é o Owner do sistema.'
          : 'Bem-vindo ao painel AKROID.'}
      </p>
    </div>
  )
}