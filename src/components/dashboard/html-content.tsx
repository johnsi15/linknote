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
    // Sanitizar el HTML con DOMPurify
    const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    setSanitizedHtml(clean)
  }, [html])

  useEffect(() => {
    if (!contentRef.current) return

    // Limpiar raíces anteriores
    rootsRef.current.forEach(root => {
      try {
        root.unmount()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Ignorar errores
      }
    })
    rootsRef.current = []

    // Buscar bloques de código
    const preElements = contentRef.current.querySelectorAll('pre')

    // Procesar cada bloque
    Array.from(preElements).forEach((pre, index) => {
      const codeElement = pre.querySelector('code')
      if (!codeElement) return

      // Obtener contenido y atributos
      const code = codeElement.textContent || ''
      const language = pre.getAttribute('data-language')?.toLowerCase() || 'javascript'

      // Extraer estilos
      const styleString = pre.getAttribute('style') || ''
      const styleObj: Record<string, string> = {}

      if (styleString) {
        styleString.split(';').forEach(rule => {
          const [property, value] = rule.split(':')
          if (property && value) {
            const prop = property.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
            styleObj[prop] = value.trim()
          }
        })
      }

      // Crear contenedor
      const container = document.createElement('div')
      container.id = `prism-container-${index}`

      // Insertar en el DOM
      pre.parentNode?.insertBefore(container, pre)
      pre.style.display = 'none'

      try {
        // Renderizar Highlight
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
                  ...styleObj,
                  margin: styleObj.margin || '0',
                  padding: styleObj.padding || '1rem',
                  borderRadius: styleObj.borderRadius || '0.5rem',
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
        console.error('Error al renderizar bloque de código:', error)
        // Si falla, mostrar el bloque original
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
