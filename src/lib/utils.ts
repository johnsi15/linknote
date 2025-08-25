import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractSummary(html: string, maxLength: number = 100): string {
  if (!html) return ''

  const temp = document.createElement('div')
  temp.innerHTML = html

  const elementsToRemove = temp.querySelectorAll('pre, code, img, iframe, table')
  elementsToRemove.forEach(el => el.remove())

  let text = temp.textContent || temp.innerText || ''

  text = text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text

  let lastSpace = text.lastIndexOf(' ', maxLength)
  if (lastSpace <= 0) lastSpace = maxLength

  return text.substring(0, lastSpace).trim() + '...'
}

export function isDescriptionEmpty(desc: string) {
  const text = desc.replace(/<[^>]+>/g, '').trim()

  return text.length === 0
}

export function cleanHtmlContent(html: string | null | undefined): string {
  if (!html) return ''

  let cleaned = html

  if (/<body[\s>]/i.test(cleaned)) {
    const match = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    cleaned = match ? match[1] : cleaned
  }

  return cleaned
    .replace(/\s*data-meta-[^=]*="[^"]*"/g, '')
    .replace(/\s*style="[^"]*"/g, '')
    .replace(/<p\s+>/g, '<p>')
    .replace(/<p><\/p>/g, '')
    .trim()
}
