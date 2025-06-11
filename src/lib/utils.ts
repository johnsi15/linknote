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
