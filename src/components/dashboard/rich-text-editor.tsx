'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [isMounted, setIsMounted] = useState(false)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const { editor, htmlToYoopta, yooptaToHtml, setEditorValue, cleanYooptaHtml } = useYooptaConverter()
  const selectionRef = useRef<HTMLDivElement>(null)
  const lastValueRef = useRef(value)
  const [editorValue, setEditorValueState] = useState<YooptaContentValue>()
  const isUpdatingRef = useRef(false)

  // Initialize editor on mount
  useEffect(() => {
    setIsMounted(true)
    // Wait a bit for editor to be fully initialized
    const timer = setTimeout(() => {
      setIsEditorReady(true)
    }, 100)

    return () => {
      setIsMounted(false)
      clearTimeout(timer)
    }
  }, [])

  // Initialize editor with initial value
  useEffect(() => {
    if (!isMounted || !isEditorReady || !editor) return

    // Force initialization if we have a value but editor is empty
    const hasInitialValue = value && value.trim() !== ''
    const needsInitialization = !lastValueRef.current || !editorValue

    if (hasInitialValue && needsInitialization) {
      try {
        const yooptaValue = htmlToYoopta(value)

        if (yooptaValue) {
          isUpdatingRef.current = true

          // Force a complete reset of the editor
          editor.setEditorValue({})

          // Small delay to ensure the reset is processed
          setTimeout(() => {
            setEditorValue(yooptaValue)
            setEditorValueState(yooptaValue)
            lastValueRef.current = value

            // Reset the flag after another delay
            setTimeout(() => {
              isUpdatingRef.current = false
            }, 100)
          }, 50)
        }
      } catch (error) {
        console.error('Error initializing editor value:', error)
        isUpdatingRef.current = false
      }
    }
  }, [value, isMounted, isEditorReady, editor, htmlToYoopta, setEditorValue, editorValue])

  // Update editor when value changes from outside (but not from internal changes)
  useEffect(() => {
    if (!isMounted || !isEditorReady || !editor || isUpdatingRef.current) return

    // Skip if this is the first mount and we're handling it in the initialization effect
    if (!lastValueRef.current && value) return

    // Simple comparison - avoid complex HTML cleaning for comparison
    if (value === lastValueRef.current) {
      return
    }

    // If both values exist, do a more thorough comparison
    if (value && lastValueRef.current) {
      const cleanedNew = cleanYooptaHtml(value)
      const cleanedLast = cleanYooptaHtml(lastValueRef.current)

      if (cleanedNew === cleanedLast) {
        return
      }
    }

    try {
      isUpdatingRef.current = true
      const yooptaValue = htmlToYoopta(value || '')
      if (yooptaValue) {
        setEditorValue(yooptaValue)
        setEditorValueState(yooptaValue)
        lastValueRef.current = value
      }
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 100)
    } catch (error) {
      console.error('Error updating editor value:', error)
      isUpdatingRef.current = false
    }
  }, [value, isMounted, isEditorReady, editor, htmlToYoopta, setEditorValue, cleanYooptaHtml])

  const handleEditorChange = (newValue: YooptaContentValue) => {
    if (isUpdatingRef.current) {
      return
    }

    try {
      setEditorValueState(newValue)
      const html = yooptaToHtml(newValue)

      if (html !== lastValueRef.current) {
        lastValueRef.current = html
        onChange(html)
      }
    } catch (error) {
      console.error('Error converting editor content to HTML:', error)
    }
  }

  if (!isMounted || !isEditorReady) {
    return (
      <div className={cn('dark:bg-transparent dark:text-white min-h-[120px] w-full p-4', className)}>
        Loading editor...
      </div>
    )
  }

  return (
    <div className={cn('dark:bg-transparent dark:text-white min-h-[120px] w-full', className)}>
      <div ref={selectionRef} />
      <YooptaEditor
        key='yoopta-editor'
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        onChange={handleEditorChange}
        selectionBoxRoot={selectionRef}
        placeholder="Type '/' for commands"
        className='w-full! pb-5!'
        marks={MARKS}
        value={editorValue}
        autoFocus
      />
    </div>
  )
}
