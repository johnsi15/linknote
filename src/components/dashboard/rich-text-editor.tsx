'use client'

import { useRef, useMemo } from 'react'
import YooptaEditor, { createYooptaEditor, YooEditor, YooptaContentValue } from '@yoopta/editor';
import Paragraph from '@yoopta/paragraph'
import { html } from '@yoopta/exports'
import { nanoid } from 'nanoid'

// Asegúrate de que los plugins estén correctamente configurados
const plugins = [Paragraph];

export function RichTextEditor({ 
  value, 
  onChange 
}: { 
  value: string
  onChange: (value: string) => void 
}) {
  const editor: YooEditor = useMemo(() => createYooptaEditor(), [])
  const selectionRef = useRef(null)

  const TOOLS = {}

  const generateId = () => nanoid()

  // Función para convertir el contenido del editor a HTML usando @yoopta/exports
  const handleEditorChange = (value: YooptaContentValue) => {
    try {
      const htmlContent = html.serialize(editor, value)
      onChange(htmlContent)
    } catch (error) {
      console.error('Error serializing to HTML:', error)
      onChange('')
    }
  }

  // Función para convertir HTML a formato Yoopta usando @yoopta/exports
  const createInitialValue = (htmlString: string): YooptaContentValue => {
    const id = generateId()

    if (!htmlString || typeof htmlString !== 'string') {
      return {
        [id]: {
          id: id,
          type: 'paragraph',
          value: [
            {
              id: id,
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        },
      }
    }
    
    try {
      // Intenta deserializar el HTML
      const value = html.deserialize(editor, htmlString)

      return value
    } catch (error) {
      console.error('Error deserializing HTML:', error)
      // Fallback: crear un párrafo simple con el contenido
      
      return {
        [id]: {
          id: id,
          type: 'paragraph',
          value: [
            {
              id: id,
              type: 'paragraph',
              children: [{ text: htmlString }],
            },
          ],
        },
      }
    }
  }

  // Asegurarse de que initialValue nunca sea undefined y tenga la estructura correcta
  const initialValue = createInitialValue(value)

  return (
    <div className="border rounded-md p-3 min-h-[120px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        value={initialValue}
        onChange={handleEditorChange}
        selectionBoxRoot={selectionRef}
        placeholder="Enter description..."
      />
      <div ref={selectionRef} />
    </div>
  )
}