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
    // Si no hay HTML, devolver undefined
    if (!htmlString || typeof htmlString !== 'string' || htmlString.trim() === '') {
      return undefined
    }

    try {
      // Intentar deserializar HTML
      const deserializedValue = html.deserialize(editor, htmlString)

      // Validar el valor deserializado
      if (!deserializedValue || typeof deserializedValue !== 'object' || Object.keys(deserializedValue).length === 0) {
        console.warn('La deserialización devolvió un valor vacío o inválido')
        return undefined
      }

      // Validar que cada bloque tenga la estructura requerida
      const validatedValue: YooptaContentValue = {}
      let hasValidBlocks = false

      Object.entries(deserializedValue).forEach(([blockId, block]) => {
        if (block && typeof block === 'object' && 'type' in block && 'value' in block) {
          validatedValue[blockId] = {
            ...block,
            id: block.id || blockId,
            meta: block.meta || { order: 0, depth: 0 },
          }
          hasValidBlocks = true
        }
      })

      if (!hasValidBlocks) {
        console.warn('No se encontraron bloques válidos después de la deserialización')
        return undefined
      }

      return validatedValue
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

  return {
    editor,
    htmlToYoopta,
    yooptaToHtml,
  }
}
