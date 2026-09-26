import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

const STATUS_COLORS: Record<string, string> = {
  novo: 'bg-blue-900 text-blue-300',
  contatado: 'bg-amber-900 text-amber-300',
  proposta: 'bg-purple-900 text-purple-300',
  negociacao: 'bg-orange-900 text-orange-300',
  fechado: 'bg-emerald-900 text-emerald-300',
  perdido: 'bg-red-900 text-red-300',
}

export default async function LeadsPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, whatsapp, city, project_type, status, source, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold">Leads</h1>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Recebido em</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {leads?.length ? (
              leads.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{lead.name}</td>
                  <td className="px-4 py-3 text-slate-400">{lead.whatsapp}</td>
                  <td className="px-4 py-3 text-slate-400">{lead.city ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400 capitalize">
                    {lead.project_type ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 capitalize">
                    {lead.source}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        STATUS_COLORS[lead.status] ?? 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-slate-400 hover:text-white"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                  Nenhum lead recebido ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}