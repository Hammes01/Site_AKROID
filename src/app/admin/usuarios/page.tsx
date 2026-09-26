import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions/getUserPermissions'

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

export default async function UsuariosPage() {
  const { permissions } = await getUserPermissions()

  if (!permissions.includes('users.manage')) {
    redirect('/admin/dashboard')
  }

  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, status, is_owner, user_roles!user_roles_user_id_fkey(roles(name))')
    .order('created_at', { ascending: true })

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <Link
          href="/admin/usuarios/novo"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          + Novo usuário
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {profiles?.length ? (
              profiles.map((p: Profile) => (
                <tr key={p.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{p.full_name}</td>
                  <td className="px-4 py-3 text-slate-400">{p.email}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {p.is_owner
                      ? 'Owner'
                      : p.user_roles?.[0]?.roles?.[0]?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.status === 'active'
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!p.is_owner && (
                      <Link
                        href={`/admin/usuarios/${p.id}`}
                        className="text-slate-400 hover:text-white"
                      >
                        Editar
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Nenhum usuário cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}