import { useMemo } from 'react'
import { createYooptaEditor, YooEditor, YooptaContentValue } from '@yoopta/editor'
import { html } from '@yoopta/exports'

/**
 * Hook for converting entry HTML to Yoopta format and viceversa
 */
export function useYooptaConverter() {
  const editor: YooEditor = useMemo(() => createYooptaEditor(), [])

  /**
   * Cleans HTML from Yoopta-specific attributes and structure
   */
  const cleanYooptaHtml = (htmlString: string): string => {
    if (!htmlString || typeof htmlString !== 'string') return ''

    try {
      // Parse the HTML to properly handle the content
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, 'text/html')

      // If we have a Yoopta body, get its innerHTML
      const yooptaBody = doc.querySelector('body#yoopta-clipboard')
      if (yooptaBody) {
        const content = yooptaBody.innerHTML.trim()
        return content
      }

      // Otherwise, clean up any Yoopta-specific attributes from the content
      const body = doc.body || doc.documentElement
      const elements = body.querySelectorAll('*')

      elements.forEach(el => {
        // Remove Yoopta-specific attributes
        const attrs = el.getAttributeNames()
        attrs.forEach(attr => {
          if (
            attr.startsWith('data-meta-') ||
            attr.startsWith('data-yoopta-') ||
            attr === 'data-editor-id' ||
            attr.startsWith('data-slate-')
          ) {
            el.removeAttribute(attr)
          }
        })
      })

      // Return the cleaned HTML without the body tag
      const result = body.innerHTML.trim()

      // Handle empty content cases
      if (!result || result === '<p></p>' || result === '<div></div>') {
        return ''
      }

      return result
    } catch (error) {
      console.error('Error cleaning HTML:', error)
      return htmlString
    }
  }

  /**
   * Converts HTML to Yoopta format
   */
  const htmlToYoopta = (htmlString: string): YooptaContentValue | undefined => {
    console.log('Converting HTML to Yoopta:', htmlString)

    // If no HTML, return default empty paragraph
    if (!htmlString || typeof htmlString !== 'string' || htmlString.trim() === '') {
      return {
        '1': {
          id: '1',
          type: 'paragraph',
          value: [{ text: '' }],
          meta: { order: 0, depth: 0 },
        },
      }
    }

    try {
      // Usar html.deserialize para convertir el HTML a formato Yoopta
      const deserialized = html.deserialize(editor, htmlString)
      console.log('Deserialized content:', deserialized)
      return deserialized
    } catch (error) {
      console.error('Error deserializing HTML:', error)
      console.error('HTML that caused error:', htmlString)

      // Fallback: retornar párrafo con texto de error
      return {
        '1': {
          id: '1',
          type: 'paragraph',
          value: [{ text: 'Error loading content' }],
          meta: { order: 0, depth: 0 },
        },
      }
    }
  }

  /**
   * Converts Yoopta format to HTML
   */
  const yooptaToHtml = (yooptaValue: YooptaContentValue): string => {
    try {
      if (!yooptaValue || Object.keys(yooptaValue).length === 0) {
        return ''
      }

      const result = html.serialize(editor, yooptaValue)
      console.log('Serialized HTML:', result)
      return result
    } catch (error) {
      console.error('Error serializing to HTML:', error)
      console.error('Yoopta value that caused error:', yooptaValue)
      return ''
    }
  }

  const setEditorValue = (value: YooptaContentValue) => {
    try {
      console.log('Setting editor value:', value)
      editor.setEditorValue(value)
    } catch (error) {
      console.error('Error setting editor value:', error)
    }
  }

  return { editor, htmlToYoopta, yooptaToHtml, setEditorValue, cleanYooptaHtml }
}
