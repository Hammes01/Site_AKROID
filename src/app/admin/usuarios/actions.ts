'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserPermissions } from '@/lib/permissions/getUserPermissions'

export async function createUser(formData: FormData) {
  // Checagem extra de segurança: mesmo com RLS no banco, vale reforçar
  // aqui, já que esta ação usa a Secret key (que ignora RLS).
  const { permissions } = await getUserPermissions()
  if (!permissions.includes('users.manage')) {
    throw new Error('Sem permissão para criar usuários.')
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const roleId = formData.get('role_id') as string

  const adminClient = createAdminClient()

  // 1. Cria o usuário no Supabase Auth (já confirmado, sem precisar de e-mail)
  const { data: authUser, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

  if (authError) {
    throw new Error(authError.message)
  }

  // 2. O trigger handle_new_user() já cria o profile automaticamente.
  //    Vamos atualizar o nome (caso o trigger não tenha pego o metadata).
  await adminClient
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', authUser.user.id)

  // 3. Atribui o role escolhido
  if (roleId) {
    await adminClient.from('user_roles').insert({
      user_id: authUser.user.id,
      role_id: roleId,
    })
  }

  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios')
}

export async function deactivateUser(id: string) {
  const { permissions } = await getUserPermissions()
  if (!permissions.includes('users.manage')) {
    throw new Error('Sem permissão.')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/usuarios')
}

export async function reactivateUser(id: string) {
  const { permissions } = await getUserPermissions()
  if (!permissions.includes('users.manage')) {
    throw new Error('Sem permissão.')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/usuarios')
}