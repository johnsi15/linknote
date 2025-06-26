'use client'

import { useEffect, useRef } from 'react'
import YooptaEditor, { YooptaContentValue } from '@yoopta/editor'
import Paragraph from '@yoopta/paragraph'
import Code from '@yoopta/code'
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists'
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings'
import Divider from '@yoopta/divider'
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
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Paragraph,
  Code,
  Divider,
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
  NumberedList,
  BulletedList,
  TodoList,
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
  const lastValueRef = useRef(value)

  // Update editor when value changes
  useEffect(() => {
    // Only update if value has actually changed
    if (value !== lastValueRef.current) {
      lastValueRef.current = value

      try {
        const yooptaValue = htmlToYoopta(value || '')
        if (yooptaValue) {
          setEditorValue(yooptaValue)
        }
      } catch (error) {
        console.error('Error updating editor value:', error)
      }
    }
  }, [value, htmlToYoopta, setEditorValue])

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
    <div className={cn('dark:bg-transparent dark:text-white min-h-[120px] w-full', className)}>
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
