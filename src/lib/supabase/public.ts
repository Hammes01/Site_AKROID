import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Acesso público (chave anônima), sem ler cookies do visitante.
// Usado nas páginas que ficam em cache: ler cookies tornaria cada visita única.
// As regras de RLS valem normalmente, então só aparece o que já é público.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
