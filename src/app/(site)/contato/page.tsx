'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackLead } from '@/lib/track'
import { submitLead } from './actions'

const initialState = { success: false, message: '' }

export default function ContatoPage() {
  const searchParams = useSearchParams()
  const kitInteresse = searchParams.get('kit')

  const [state, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await submitLead(formData)
      if (result.success) trackLead('site')
      return result
    },
    initialState
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">
        Solicite um orçamento
      </h1>
      <p className="mt-2 text-slate-600">
        Preencha os dados abaixo e nosso time entra em contato pelo WhatsApp.
      </p>

      {kitInteresse && (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-600">
          Interesse em: <strong>{kitInteresse}</strong>
        </p>
      )}

      {state.success ? (
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
          {state.message}
        </div>
      ) : (
        <form action={formAction} className="mt-8 space-y-4">
          {kitInteresse && (
            <input type="hidden" name="kit_interest" value={kitInteresse} />
          )}

          <div>
            <label className="mb-1 block text-sm text-slate-700">
              Nome *
            </label>
            <input
              name="name"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">
              WhatsApp *
            </label>
            <input
              name="whatsapp"
              required
              placeholder="(66) 99999-9999"
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">
              Cidade
            </label>
            <input
              name="city"
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">
              Tipo de projeto
            </label>
            <select
              name="project_type"
              defaultValue={kitInteresse ? 'residencial' : ''}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            >
              <option value="">Selecione...</option>
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          <div>
            <label htmlFor="monthly_bill" className="mb-1 block text-sm text-slate-700">
              Valor médio da conta de luz (R$)
            </label>
            <input
              id="monthly_bill"
              name="monthly_bill"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="Ex.: 500"
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          {state.message && !state.success && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {pending ? 'Enviando...' : 'Solicitar orçamento'}
          </button>
        </form>
      )}
    </div>
  )
}