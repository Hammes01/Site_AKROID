'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Media = {
  id: string
  url: string
  phase: string | null
  sort_order: number | null
}

const PHASES = [
  { value: 'antes', label: 'Antes' },
  { value: 'durante', label: 'Durante' },
  { value: 'depois', label: 'Depois' },
]

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const NO_PERMISSION = 'Você não tem permissão para alterar este projeto.'

export default function ProjectMediaManager({
  projectId,
  projectTitle,
  initialMedia,
}: {
  projectId: string
  projectTitle: string
  initialMedia: Media[]
}) {
  const [media, setMedia] = useState(initialMedia)
  const [phase, setPhase] = useState('depois')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    const files = Array.from(fileInputRef.current?.files ?? [])
    if (files.length === 0) {
      setError('Selecione ao menos uma foto.')
      return
    }

    const invalid = files.find((file) => !EXTENSIONS[file.type] || file.size > MAX_FILE_SIZE)
    if (invalid) {
      setError(`"${invalid.name}" precisa ser JPG, PNG ou WebP de até 10 MB.`)
      return
    }

    setBusy(true)
    setError(null)
    const supabase = createClient()
    let nextOrder = Math.max(0, ...media.map((item) => item.sort_order ?? 0)) + 1

    // Upload direto do navegador, igual ao vídeo do hero, para não
    // esbarrar no limite de tamanho de requisição do hospedeiro.
    for (const [i, file] of files.entries()) {
      const path = `projects/${projectId}/${Date.now()}-${i}.${EXTENSIONS[file.type]}`

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        setError(`Falha ao enviar "${file.name}": ${uploadError.message}`)
        break
      }

      const { data: publicUrlData } = supabase.storage.from('site-assets').getPublicUrl(path)

      const { data: row, error: dbError } = await supabase
        .from('project_media')
        .insert({
          project_id: projectId,
          url: publicUrlData.publicUrl,
          phase,
          sort_order: nextOrder,
        })
        .select('id, url, phase, sort_order')
        .single()

      if (dbError) {
        // Sem o registro no banco, o arquivo ficaria órfão no Storage
        await supabase.storage.from('site-assets').remove([path])
        setError(`Falha ao salvar "${file.name}": ${dbError.message}`)
        break
      }

      nextOrder += 1
      setMedia((current) => [...current, row])
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
    setBusy(false)
  }

  async function handlePhaseChange(id: string, newPhase: string) {
    setError(null)
    const supabase = createClient()
    const { data, error: dbError } = await supabase
      .from('project_media')
      .update({ phase: newPhase })
      .eq('id', id)
      .select('id')

    if (dbError || !data?.length) {
      setError(dbError?.message ?? NO_PERMISSION)
      return
    }

    setMedia((current) =>
      current.map((item) => (item.id === id ? { ...item, phase: newPhase } : item))
    )
  }

  async function handleDelete(item: Media) {
    if (!window.confirm('Excluir esta foto?')) return

    setBusy(true)
    setError(null)
    const supabase = createClient()
    const { data, error: dbError } = await supabase
      .from('project_media')
      .delete()
      .eq('id', item.id)
      .select('id')

    if (dbError || !data?.length) {
      setBusy(false)
      setError(dbError?.message ?? NO_PERMISSION)
      return
    }

    const path = decodeURIComponent(item.url.split('/site-assets/')[1] ?? '')
    if (path) {
      const { error: storageError } = await supabase.storage.from('site-assets').remove([path])
      if (storageError) {
        setError(`Foto removida do site, mas o arquivo continua no Storage: ${storageError.message}`)
      }
    }

    setMedia((current) => current.filter((other) => other.id !== item.id))
    setBusy(false)
  }

  return (
    <section className="mt-10 max-w-3xl border-t border-slate-800 pt-8">
      <h2 className="text-lg font-semibold">Fotos do projeto</h2>
      <p className="mt-1 text-sm text-slate-400">
        A primeira foto da fase &quot;Depois&quot; vira a capa do case na home. As
        alterações de fotos são salvas na hora.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="media-files" className="mb-1 block text-sm text-slate-300">
            Fotos (JPG, PNG ou WebP, até 10 MB)
          </label>
          <input
            ref={fileInputRef}
            id="media-files"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:text-white"
          />
        </div>
        <div>
          <label htmlFor="media-phase" className="mb-1 block text-sm text-slate-300">
            Fase
          </label>
          <select
            id="media-phase"
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-slate-500"
          >
            {PHASES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleUpload}
          disabled={busy}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50"
        >
          {busy ? 'Aguarde...' : 'Enviar fotos'}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {media.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {media.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-lg border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={`${projectTitle} — ${item.phase ?? ''}`}
                className="aspect-video w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 p-2">
                <select
                  aria-label="Fase da foto"
                  value={item.phase ?? ''}
                  onChange={(e) => handlePhaseChange(item.id, e.target.value)}
                  className="min-w-0 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm outline-none focus:border-slate-500"
                >
                  {PHASES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={busy}
                  className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-slate-500">Nenhuma foto enviada ainda.</p>
      )}
    </section>
  )
}
