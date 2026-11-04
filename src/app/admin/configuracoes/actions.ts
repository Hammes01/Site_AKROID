'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Atualiza as páginas em cache do site (home, rodapé, contato) depois de uma mudança
// feita direto pelo navegador no admin. Só quem está logado pode pedir.
export async function revalidateHome() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  revalidatePath('/admin/configuracoes')
  revalidatePath('/', 'layout')
}
