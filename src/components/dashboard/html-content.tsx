'use client'

import { useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { Highlight, themes } from 'prism-react-renderer'
import { createRoot } from 'react-dom/client'

interface HtmlContentProps {
  html: string
  className?: string
}

export function HtmlContent({ html, className = '' }: HtmlContentProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootsRef = useRef<any[]>([])

  useEffect(() => {
    return () => {
      rootsRef.current.forEach(root => {
        try {
          root.unmount()
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // Ignorar errores
        }
      })
    }
  }, [])

  useEffect(() => {
    const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    setSanitizedHtml(clean)
  }, [html])

  useEffect(() => {
    if (!contentRef.current) return

    rootsRef.current.forEach(root => {
      try {
        root.unmount()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Ignorar errores
      }
    })
    rootsRef.current = []

    // Search pre elements
    const preElements = contentRef.current.querySelectorAll('pre')

    Array.from(preElements).forEach((pre, index) => {
      const codeElement = pre.querySelector('code')
      if (!codeElement) return

      const code = codeElement.textContent || ''
      const language = pre.getAttribute('data-language')?.toLowerCase() || 'javascript'

      const container = document.createElement('div')
      container.id = `prism-container-${index}`

      pre.parentNode?.insertBefore(container, pre)
      pre.style.display = 'none'

      try {
        const root = createRoot(container)
        rootsRef.current.push(root)

        root.render(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Highlight code={code} language={language as any} theme={themes.oneDark}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={className}
                style={{
                  ...style,
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  overflow: 'auto',
                }}
              >
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        )
      } catch (error) {
        console.error('Error the render block code pre:', error)
        pre.style.display = 'block'
      }
    })
  }, [sanitizedHtml])

  return (
    <div
      ref={contentRef}
      className={`yoopta-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
