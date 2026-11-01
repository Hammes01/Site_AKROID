export const KIT_INCLUDES = [
  { value: 'placas', label: 'Placas' },
  { value: 'inversor', label: 'Inversor' },
  { value: 'estrutura', label: 'Estrutura' },
  { value: 'instalacao', label: 'Instalação' },
]

export function describeKitIncludes(values: string[] | null | undefined) {
  const labels = KIT_INCLUDES.filter((option) => values?.includes(option.value)).map((option) =>
    option.label.toLowerCase()
  )
  if (labels.length === 0) return null
  return `Inclui ${new Intl.ListFormat('pt-BR', { type: 'conjunction' }).format(labels)}.`
}
