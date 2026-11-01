import type { ProcessStep } from '@/lib/sales-config'

export default function AboutSection({
  steps,
  trustItems,
  story,
  photoUrl,
}: {
  steps: ProcessStep[]
  trustItems: string[]
  story: string | null
  photoUrl: string | null
}) {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Quem cuida do seu projeto
          </h2>

          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Equipe da AKROID"
              loading="lazy"
              className="mt-8 aspect-video w-full rounded-2xl object-cover"
            />
          )}

          {story && <p className="mt-6 text-lg whitespace-pre-line text-slate-600">{story}</p>}

          {trustItems.length > 0 && (
            <ul className="mt-8 space-y-3">
              {trustItems.map((item) => (
                <li key={item} className="flex gap-3 text-lg font-medium text-slate-900">
                  <span aria-hidden="true" className="text-brand-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        {steps.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Como funciona</h3>
            <ol className="mt-6 space-y-6">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    {step.text && <p className="mt-1 text-slate-600">{step.text}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}
