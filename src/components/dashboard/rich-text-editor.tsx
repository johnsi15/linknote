'use client'

import { useEffect, useRef } from 'react'
import YooptaEditor, { YooptaContentValue } from '@yoopta/editor'
import Paragraph from '@yoopta/paragraph'
import Code from '@yoopta/code'
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks'
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool'
import NextLink from 'next/link'
import Link from '@yoopta/link'
import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list'
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar'
import { useYooptaConverter } from '@/hooks/use-yoopta-converter'
import { cn } from '@/lib/utils'

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight]

const plugins = [
  Paragraph,
  Code,
  Link.extend({
    renders: {
      link: ({ attributes, children, element }) => (
        <NextLink
          {...attributes}
          data-key={element.id}
          className='text-blue-500 hover:underline'
          href={element.props.url}
          target={element.props.target}
          rel={element.props.rel}
        >
          {children}
        </NextLink>
      ),
    },
  }),
]

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
  className?: string
}

export function RichTextEditor({ className, value, onChange }: RichTextEditorProps) {
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
    <div
      className={cn(
        'dark:bg-zinc-900 dark:text-white border rounded-md pt-3 pb-3 pr-3 pl-12 min-h-[120px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-full',
        className
      )}
    >
      <div ref={selectionRef} />
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        onChange={handleEditorChange}
        selectionBoxRoot={selectionRef}
        placeholder="Type '/' for commands"
        className='w-full!'
        marks={MARKS}
      />
    </div>
  )
}
