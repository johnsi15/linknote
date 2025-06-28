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

export function isDescriptionEmpty(desc: string) {
  // Detecta string vacío o body Yoopta vacío (sin contenido visible)
  // if (!desc) return true
  // return /^<body[^>]*>\s*<p[^>]*>\s*<\/p>\s*<\/body>$/.test(desc.trim())

  // Quita todas las etiquetas HTML y espacios
  const text = desc.replace(/<[^>]+>/g, '').trim()
  return text.length === 0
}

export function concatenateHtmlContent(currentContent: string, newContent: string): string {
  // Si el contenido actual está vacío, solo devolver el nuevo
  if (!currentContent || !currentContent.trim()) {
    return newContent
  }

  // Si el nuevo contenido está vacío, devolver el actual
  if (!newContent || !newContent.trim()) {
    return currentContent
  }

  // Si el contenido actual termina con un párrafo, agregar el nuevo contenido después
  if (currentContent.trim().endsWith('</p>')) {
    return currentContent + newContent
  }

  // Si el contenido actual no termina con un párrafo, agregar un párrafo vacío como separador
  return currentContent + '<p></p>' + newContent
}
