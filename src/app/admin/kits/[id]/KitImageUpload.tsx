'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const NO_PERMISSION = 'Você não tem permissão para alterar este kit.'

export default function KitImageUpload({
  kitId,
  kitName,
  initialUrl,
}: {
  kitId: string
  kitName: string
  initialUrl: string | null
}) {
  const [url, setUrl] = useState(initialUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function saveUrl(next: string | null) {
    const { data, error: dbError } = await createClient()
      .from('kits')
      .update({ main_image_url: next })
      .eq('id', kitId)
      .select('id')
    if (dbError || !data?.length) {
      setError(dbError?.message ?? NO_PERMISSION)
      return false
    }
    setUrl(next)
    return true
  }

  async function removeFromStorage(target: string | null) {
    const path = decodeURIComponent(target?.split('/site-assets/')[1] ?? '')
    if (path.startsWith('kits/')) await createClient().storage.from('site-assets').remove([path])
  }

  async function handleUpload() {
    const file = inputRef.current?.files?.[0]
    if (!file) {
      setError('Selecione uma foto.')
      return
    }
    if (!EXTENSIONS[file.type] || file.size > MAX_FILE_SIZE) {
      setError('A foto precisa ser JPG, PNG ou WebP de até 10 MB.')
      return
    }

    setBusy(true)
    setError(null)
    const supabase = createClient()
    const path = `kits/${kitId}/${Date.now()}.${EXTENSIONS[file.type]}`
    const { error: uploadError } = await supabase.storage.from('site-assets').upload(path, file)

    if (uploadError) {
      setError(uploadError.message)
    } else {
      const previous = url
      const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
      if (await saveUrl(data.publicUrl)) await removeFromStorage(previous)
      else await supabase.storage.from('site-assets').remove([path])
    }

    if (inputRef.current) inputRef.current.value = ''
    setBusy(false)
  }

  async function handleRemove() {
    if (!window.confirm('Remover a foto deste kit?')) return
    setBusy(true)
    setError(null)
    const previous = url
    if (await saveUrl(null)) await removeFromStorage(previous)
    setBusy(false)
  }

  return (
    <section className="mt-10 max-w-xl border-t border-slate-800 pt-8">
      <h2 className="text-lg font-semibold">Foto do kit</h2>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={kitName} className="mt-4 aspect-video w-full rounded-lg object-cover" />
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          aria-label="Foto do kit"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:text-white"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={busy}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50"
        >
          {busy ? 'Aguarde...' : 'Enviar foto'}
        </button>
        {url && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            Remover
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </section>
  )
}
