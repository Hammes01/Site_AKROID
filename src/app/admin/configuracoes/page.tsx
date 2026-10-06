'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revalidateHome } from './actions'

export default function ConfiguracoesPage() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null)

    async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const file = formData.get('file') as File

    if (!file || file.size === 0) {
      setMessage({ text: 'Selecione um arquivo de vídeo.', success: false })
      return
    }

    setUploading(true)
    const supabase = createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `hero-video-${Date.now()}.${fileExt}`

    // Upload direto do navegador para o Supabase Storage —
    // não passa pelo servidor do Next.js/Netlify, evitando
    // limites de tamanho de requisição do hospedeiro.
    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(fileName, file, { upsert: false })

    if (uploadError) {
      setUploading(false)
      setMessage({ text: uploadError.message, success: false })
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('site-assets')
      .getPublicUrl(fileName)

    const { error: dbError } = await supabase
      .from('site_settings')
      .upsert({ key: 'hero_video', value: { url: publicUrlData.publicUrl } })

    setUploading(false)

    if (dbError) {
      setMessage({ text: dbError.message, success: false })
      return
    }

        await revalidateHome()
    setMessage({ text: 'Vídeo atualizado com sucesso!', success: true })
    form.reset()
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold">Configurações do site</h1>

      <div className="mt-6 max-w-md rounded-lg border border-slate-800 p-6">
        <h2 className="text-sm font-semibold text-slate-300">
          Vídeo do Hero (home)
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Vídeo curto, em loop, sem áudio. Recomendado: MP4, poucos segundos,
          até ~20MB para não deixar o site lento.
        </p>

        <form onSubmit={handleUpload} className="mt-4 space-y-3">
          <input
            type="file"
            name="file"
            accept="video/mp4,video/webm"
            required
            className="w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:text-white"
          />

          {message && (
            <p
              className={`text-sm ${
                message.success ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : 'Enviar vídeo'}
          </button>
        </form>
      </div>
    </div>
  )
}