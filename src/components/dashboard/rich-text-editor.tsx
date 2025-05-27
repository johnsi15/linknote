'use client'

import { useRef, useMemo } from 'react'
import YooptaEditor, { createYooptaEditor, YooEditor, YooptaContentValue } from '@yoopta/editor'
import Paragraph from '@yoopta/paragraph'
import { html } from '@yoopta/exports'
import Code from '@yoopta/code'
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool'
import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list'
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar'
// import { nanoid } from 'nanoid'

// Asegúrate de que los plugins estén correctamente configurados
const plugins = [Paragraph, Code]

const TOOLS = {
  Toolbar: {
    tool: Toolbar,
    render: DefaultToolbarRender,
  },
  ActionMenu: {
    tool: ActionMenu,
    render: DefaultActionMenuRender,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor: YooEditor = useMemo(() => createYooptaEditor(), [])
  const selectionRef = useRef(null)
  console.log({ value })
  // const generateId = () => nanoid()

  const handleEditorChange = (editorValue: YooptaContentValue) => {
    try {
      const htmlContent = html.serialize(editor, editorValue)
      onChange(htmlContent)
    } catch (error) {
      console.error('Error serializing to HTML:', error)
      onChange('')
    }
  }

  // Function to convert HTML to Yoopta format
  const createInitialValue = (htmlString: string): YooptaContentValue | undefined => {
    // If no HTML string provided, let Yoopta handle it
    if (!htmlString || typeof htmlString !== 'string' || htmlString.trim() === '') {
      return undefined
    }

    try {
      // Try to deserialize HTML
      const deserializedValue = html.deserialize(editor, htmlString)

      // Validate the deserialized value
      if (!deserializedValue || typeof deserializedValue !== 'object' || Object.keys(deserializedValue).length === 0) {
        console.warn('Deserialization returned empty or invalid value, letting Yoopta handle it')
        return undefined
      }

      // Validate that each block has the required structure
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
        console.warn('No valid blocks found after deserialization, letting Yoopta handle it')
        return undefined
      }

      return validatedValue
    } catch (error) {
      console.error('Error deserializing HTML:', error)
      // Let Yoopta handle initialization
      return undefined
    }
  }

  // Create initial value
  // const initialValue = undefined
  const initialValue = useMemo(() => createInitialValue(value), [value])

  return (
    <div className='dark:bg-zinc-900 dark:text-white border rounded-md pt-3 pb-3 pr-3 pl-12 min-h-[120px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-full'>
      <div ref={selectionRef} />
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        value={initialValue}
        onChange={handleEditorChange}
        selectionBoxRoot={selectionRef}
        placeholder="Type '/' for commands"
        className='w-full!'
      />
    </div>
  )
}
