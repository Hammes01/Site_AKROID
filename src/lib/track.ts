declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

// Sem consentimento os scripts não carregam, e estas chamadas não fazem nada.
export function trackEvent(name: string) {
  window.gtag?.('event', name)
  window.fbq?.('trackCustom', name)
}

export function trackLead(source: string) {
  window.gtag?.('event', 'generate_lead', { source })
  window.fbq?.('track', 'Lead')
}
