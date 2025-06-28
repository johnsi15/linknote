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

export function concatenateHtmlContent(currentContent: string, newContent: string): string {
  if (!currentContent || !currentContent.trim()) {
    return newContent
  }

  if (!newContent || !newContent.trim()) {
    return currentContent
  }

  if (currentContent.trim().endsWith('</p>')) {
    return currentContent + newContent
  }

  return currentContent + '<p></p>' + newContent
}
