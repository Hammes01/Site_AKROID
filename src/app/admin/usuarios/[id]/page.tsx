import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions/getUserPermissions'
import { deactivateUser, reactivateUser } from '../actions'

interface Role {
  name: string
}

interface UserRole {
  roles: Role[]
}

interface Profile {
  id: string
  full_name: string
  email: string
  status: string
  is_owner: boolean
  user_roles: UserRole[]
}

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { permissions } = await getUserPermissions()

  if (!permissions.includes('users.manage')) {
    redirect('/admin/dashboard')
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, status, is_owner, user_roles!user_roles_user_id_fkey(roles(name))')
    .eq('id', id)
    .single()

  if (!profile) {
    notFound()
  }

  const deactivateWithId = deactivateUser.bind(null, id)
  const reactivateWithId = reactivateUser.bind(null, id)

  const roleName =
    (profile as Profile).user_roles?.[0]?.roles?.[0]?.name ?? 'Sem papel atribuído'

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold">{profile.full_name}</h1>

      <div className="mt-6 max-w-md space-y-4 rounded-lg border border-slate-800 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">E-mail</span>
          <span>{profile.email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Papel</span>
          <span>{roleName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Status</span>
          <span
            className={
              profile.status === 'active'
                ? 'text-emerald-400'
                : 'text-slate-400'
            }
          >
            {profile.status}
          </span>
        </div>
      </div>

      <div className="mt-6 max-w-md">
        {profile.status === 'active' ? (
          <form action={deactivateWithId}>
            <button
              type="submit"
              className="rounded-md border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
            >
              Desativar usuário
            </button>
          </form>
        ) : (
          <form action={reactivateWithId}>
            <button
              type="submit"
              className="rounded-md border border-emerald-900 px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-950"
            >
              Reativar usuário
            </button>
          </form>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Desativar impede o login, mas mantém o histórico de ações desse
          usuário no sistema (auditoria).
        </p>
      </div>
    </div>
  )
}