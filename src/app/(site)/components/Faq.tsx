// Respostas gerais de propósito: nada de prazos ou garantias que dependam de cada proposta.
const QUESTIONS = [
  {
    question: 'Em quanto tempo o sistema se paga?',
    answer:
      'Depende do seu consumo, da tarifa da distribuidora e do valor do projeto. Por isso, a proposta traz uma estimativa de retorno calculada para o seu caso.',
  },
  {
    question: 'Funciona em dia nublado ou chuvoso?',
    answer:
      'Sim, mas gera menos, porque há menos luz. O projeto é dimensionado pela média de geração ao longo do ano, considerando dias de sol e dias nublados.',
  },
  {
    question: 'O que acontece quando falta luz?',
    answer:
      'Em sistemas ligados à rede e sem baterias, a geração é interrompida durante a queda, por segurança de quem trabalha na rede. Para manter a casa ou a empresa funcionando, é preciso um sistema com baterias.',
  },
  {
    question: 'A conta de luz vai zerar?',
    answer:
      'Normalmente não. Mesmo gerando bastante, continuam existindo cobranças mínimas da distribuidora, como o custo de disponibilidade e, conforme o caso, encargos de uso da rede.',
  },
  {
    question: 'Precisa de muita manutenção?',
    answer:
      'Pouca. Em geral, bastam a limpeza dos módulos e uma inspeção periódica. A frequência varia conforme a poeira do local e a inclinação do telhado.',
  },
  {
    question: 'Quanto tempo leva até começar a gerar?',
    answer:
      'Depende do projeto, da aprovação pela distribuidora e da chegada do material até a sua região. Por isso, conversamos sobre isso caso a caso.',
  },
]

export default function Faq() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Perguntas frequentes
        </h2>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {QUESTIONS.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden="true" className="text-xl text-brand-600 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
