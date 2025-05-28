'use client'

import { useEffect, useRef } from 'react'
import YooptaEditor, { YooptaContentValue } from '@yoopta/editor'
import Paragraph from '@yoopta/paragraph'
import Code from '@yoopta/code'
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool'
import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list'
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar'
import { useYooptaConverter } from '@/hooks/use-yoopta-converter'

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
  const { editor, htmlToYoopta, yooptaToHtml, setEditorValue } = useYooptaConverter()
  const selectionRef = useRef(null)
  const initializationDoneRef = useRef(false)

  // Initialize the editor only once when the component mounts
  useEffect(() => {
    if (!initializationDoneRef.current) {
      const yooptaValue = htmlToYoopta(value)

      if (yooptaValue) {
        setEditorValue(yooptaValue)
        initializationDoneRef.current = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEditorChange = (editorValue: YooptaContentValue) => {
    try {
      const htmlContent = yooptaToHtml(editorValue)
      onChange(htmlContent)
    } catch (error) {
      console.error('Error serializing to HTML:', error)
      onChange('')
    }
  }

  return (
    <div className='dark:bg-zinc-900 dark:text-white border rounded-md pt-3 pb-3 pr-3 pl-12 min-h-[120px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-full'>
      <div ref={selectionRef} />
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        onChange={handleEditorChange}
        selectionBoxRoot={selectionRef}
        placeholder="Type '/' for commands"
        className='w-full!'
      />
    </div>
  )
}
