'use client'

import { whatsappUrl } from '@/lib/sales-config'
import { trackEvent } from '@/lib/track'

export default function WhatsAppLink({
  number,
  message,
  children,
  className,
}: {
  number: string
  message: string
  children: React.ReactNode
  className: string
}) {
  return (
    <a
      href={whatsappUrl(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('whatsapp_click')}
      className={className}
    >
      {children}
    </a>
  )
}
