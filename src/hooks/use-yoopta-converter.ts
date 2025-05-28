import { useMemo } from 'react'
import { createYooptaEditor, YooEditor, YooptaContentValue } from '@yoopta/editor'
import { html } from '@yoopta/exports'

/**
 * Hook para convertir entre HTML y formato Yoopta
 * Proporciona funciones para convertir HTML a formato Yoopta y viceversa
 */
export function useYooptaConverter() {
  // Crear una instancia del editor Yoopta
  const editor: YooEditor = useMemo(() => createYooptaEditor(), [])

  /**
   * Convierte HTML a formato Yoopta
   * @param htmlString Cadena HTML a convertir
   * @returns Valor en formato Yoopta o undefined si la conversión falla
   */
  const htmlToYoopta = (htmlString: string): YooptaContentValue | undefined => {
    console.log({ htmlString })
    // Si no hay HTML, devolver undefined
    if (!htmlString || typeof htmlString !== 'string' || htmlString.trim() === '') {
      console.log('HTML vacío o no válido')
      return undefined
    }

    try {
      // Deserializar el HTML usando la API de Yoopta
      const deserializedValue = html.deserialize(editor, htmlString)
      // editor.setEditorValue(deserializedValue)
      console.log({ deserializedValue })

      return deserializedValue
    } catch (error) {
      console.error('Error al deserializar HTML:', error)
      return undefined
    }
  }

  /**
   * Convierte formato Yoopta a HTML
   * @param yooptaValue Valor en formato Yoopta a convertir
   * @returns Cadena HTML o cadena vacía si la conversión falla
   */
  const yooptaToHtml = (yooptaValue: YooptaContentValue): string => {
    try {
      return html.serialize(editor, yooptaValue)
    } catch (error) {
      console.error('Error al serializar a HTML:', error)
      return ''
    }
  }

  return { editor, htmlToYoopta, yooptaToHtml }
}
