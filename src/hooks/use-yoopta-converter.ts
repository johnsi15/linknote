import { useMemo } from 'react'
import { createYooptaEditor, YooEditor, YooptaContentValue } from '@yoopta/editor'
import { html } from '@yoopta/exports'

/**
 * Hook for converting entry HTML to Yoopta format and viceversa
 */
export function useYooptaConverter() {
  const editor: YooEditor = useMemo(() => createYooptaEditor(), [])

  /**
   * Converts HTML to Yoopta format
   * @param htmlString HTML string to convert
   * @returns YooptaContentValue or undefined if conversion fails
   */
  const htmlToYoopta = (htmlString: string): YooptaContentValue | undefined => {
    console.log({ htmlString })
    // If no HTML, return undefined
    if (!htmlString || typeof htmlString !== 'string' || htmlString.trim() === '') {
      console.log('HTML is empty or invalid')
      return undefined
    }

    try {
      // Deserialize the HTML using Yoopta API
      const deserializedValue = html.deserialize(editor, htmlString)
      console.log({ deserializedValue })

      return deserializedValue
    } catch (error) {
      console.error('Error deserializing HTML:', error)
      return undefined
    }
  }

  /**
   * Converts Yoopta format to HTML
   * @param yooptaValue YooptaContentValue to convert
   * @returns HTML string or empty string if conversion fails
   */
  const yooptaToHtml = (yooptaValue: YooptaContentValue): string => {
    try {
      return html.serialize(editor, yooptaValue)
    } catch (error) {
      console.error('Error serializing to HTML:', error)
      return ''
    }
  }

  const setEditorValue = (value: YooptaContentValue) => {
    editor.setEditorValue(value)
  }

  return { editor, htmlToYoopta, yooptaToHtml, setEditorValue }
}
