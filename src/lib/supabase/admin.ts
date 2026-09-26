import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ATENÇÃO: este client usa a Secret key e ignora TODAS as regras de RLS.
// Nunca importe este arquivo em um Client Component ('use client'),
// nem exponha nada dele diretamente para o navegador.
// Use apenas dentro de Server Actions ou Route Handlers.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}