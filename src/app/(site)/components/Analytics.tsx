'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'akroid-analytics-consent'

function readConsent() {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function saveConsent(value: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Sem armazenamento, a escolha vale só para esta visita.
  }
}

export default function Analytics({
  gaId,
  metaPixelId,
}: {
  gaId: string | null
  metaPixelId: string | null
}) {
  const [consent, setConsent] = useState<string | null | undefined>(undefined)
  const pathname = usePathname()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage só existe no navegador; evita mismatch de hidratação
    setConsent(readConsent())
  }, [])

  // O script do Pixel conta só a primeira página; as navegações internas são contadas aqui
  useEffect(() => {
    window.fbq?.('track', 'PageView')
  }, [pathname])

  if (!gaId && !metaPixelId) return null

  function choose(value: string) {
    saveConsent(value)
    setConsent(value)
  }

  return (
    <>
      {consent === 'granted' && gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}

      {consent === 'granted' && metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {consent === null && (
        <div
          role="dialog"
          aria-label="Uso de cookies"
          className="fixed inset-x-4 bottom-22 z-50 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-lg md:right-auto md:bottom-4 md:max-w-md"
        >
          <p>
            Usamos cookies para entender como o site é usado e melhorar nossos
            anúncios. Você aceita?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => choose('granted')}
              className="rounded-full bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
            >
              Aceitar
            </button>
            <button
              type="button"
              onClick={() => choose('denied')}
              className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Recusar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
