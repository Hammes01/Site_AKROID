import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateLeadStatus, addLeadNote, deleteLead } from '../actions'

interface Profile {
  full_name: string
}

interface Note {
  id: string
  content: string
  created_at: string
  profiles: Profile[]
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (!lead) {
    notFound()
  }

  const { data: notes } = await supabase
    .from('lead_notes')
    .select('id, content, created_at, profiles(full_name)')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })

  const updateStatusWithId = updateLeadStatus.bind(null, id)
  const addNoteWithId = addLeadNote.bind(null, id)
  const deleteLeadWithId = deleteLead.bind(null, id)

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{lead.name}</h1>
        <form action={deleteLeadWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
          >
            Excluir lead
          </button>
        </form>
      </div>

      <div className="mt-6 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Dados do contato */}
        <div className="rounded-lg border border-slate-800 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-400">
            Dados do contato
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">WhatsApp</dt>
              <dd>{lead.whatsapp}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Cidade</dt>
              <dd>{lead.city ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Tipo de projeto</dt>
              <dd className="capitalize">{lead.project_type ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Origem</dt>
              <dd className="capitalize">{lead.source}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Recebido em</dt>
              <dd>
                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
              </dd>
            </div>
          </dl>
        </div>

        {/* Status do pipeline */}
        <div className="rounded-lg border border-slate-800 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-400">
            Status no pipeline
          </h2>
          <form action={updateStatusWithId} className="space-y-3">
            <select
              name="status"
              defaultValue={lead.status}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="novo">Novo</option>
              <option value="contatado">Contatado</option>
              <option value="proposta">Proposta</option>
              <option value="negociacao">Negociação</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-md bg-white py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
            >
              Atualizar status
            </button>
          </form>
        </div>
      </div>

      {/* Anotações */}
      <div className="mt-6 max-w-3xl">
        <h2 className="mb-3 text-sm font-semibold text-slate-400">
          Histórico de anotações
        </h2>

        <form action={addNoteWithId} className="mb-4 flex gap-2">
          <input
            name="content"
            required
            placeholder="Ex: Cliente respondeu no WhatsApp, agendou visita técnica..."
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
          >
            Adicionar
          </button>
        </form>

        <div className="space-y-3">
          {notes?.length ? (
            notes.map((note: Note) => (
              <div
                key={note.id}
                className="rounded-lg border border-slate-800 p-3 text-sm"
              >
                <p className="text-slate-200">{note.content}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {note.profiles?.[0]?.full_name ?? 'Usuário'} —{' '}
                  {new Date(note.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Nenhuma anotação ainda.</p>
          )}
        </div>
      </div>
    </div>
  )
}