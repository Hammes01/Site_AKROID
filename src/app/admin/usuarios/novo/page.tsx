import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions/getUserPermissions'
import { createUser } from '../actions'

export default async function NovoUsuarioPage() {
  const { permissions } = await getUserPermissions()

  if (!permissions.includes('users.manage')) {
    redirect('/admin/dashboard')
  }

  const supabase = await createClient()

  // Owner não aparece como opção — esse papel só é atribuído manualmente via SQL
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name, slug')
    .neq('slug', 'owner')
    .order('name')

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold">Novo usuário</h1>

      <form action={createUser} className="mt-6 max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Nome completo *
          </label>
          <input
            name="full_name"
            required
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">E-mail *</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Senha provisória *
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            Mínimo de 6 caracteres. Combine com o usuário depois — não há
            envio de e-mail automático nesta fase.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Papel *</label>
          <select
            name="role_id"
            required
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          >
            <option value="">Selecione...</option>
            {roles?.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          Criar usuário
        </button>
      </form>
    </div>
  )
}