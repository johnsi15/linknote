import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractSummary(html: string, maxLength: number = 100): string {
  if (!html) return ''

  const temp = document.createElement('div')
  temp.innerHTML = html

  // Eliminar elementos que no queremos en el resumen
  const elementsToRemove = temp.querySelectorAll('pre, code, img, iframe, table')
  elementsToRemove.forEach(el => el.remove())

  // Obtener texto y limpiar
  let text = temp.textContent || temp.innerText || ''

  // Limpiar espacios múltiples y saltos de línea
  text = text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim()

  // Cortar en la última palabra completa
  if (text.length <= maxLength) return text

  // Buscar el último espacio antes del límite
  let lastSpace = text.lastIndexOf(' ', maxLength)
  if (lastSpace <= 0) lastSpace = maxLength

  return text.substring(0, lastSpace).trim() + '...'
}

export function concatenateHtmlContent(existingContent: string, newContent: string): string {
  if (!existingContent || isDescriptionEmpty(existingContent)) {
    return newContent
  }

  if (!newContent) {
    return existingContent
  }

  // Si ambos tienen contenido, concatenar de forma inteligente
  // Remover las etiquetas de cierre del contenido existente y las de apertura del nuevo
  const cleanExisting = existingContent.replace(/<\/body>\s*$/, '')
  const cleanNew = newContent.replace(/^<body[^>]*>\s*/, '')

  return cleanExisting + cleanNew
}

export function isDescriptionEmpty(desc: string) {
  // Detecta string vacío o body Yoopta vacío (sin contenido visible)
  if (!desc) return true
  return /^<body[^>]*>\s*<p[^>]*>\s*<\/p>\s*<\/body>$/.test(desc.trim())
}
