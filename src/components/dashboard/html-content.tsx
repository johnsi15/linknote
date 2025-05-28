'use client'

import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

interface HtmlContentProps {
  html: string
  className?: string
}

export function HtmlContent({ html, className = '' }: HtmlContentProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState('')

  useEffect(() => {
    // Sanitizar el HTML con DOMPurify
    const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    setSanitizedHtml(clean)
  }, [html])

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
}
