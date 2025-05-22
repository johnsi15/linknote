'use client'

import { KeyboardEvent, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
}

export function TagInput({ tags, setTags }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.includes(',')) {
      const newTag = value.replace(',', '')
      addTag(newTag)
    } else {
      setInputValue(value)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    }

    // Eliminar el último tag al presionar Backspace si el input está vacío
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.map(t => t.trim().toLowerCase()).includes(trimmedTag.toLowerCase())) {
      setTags([...tags, trimmedTag])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    console.log({ tagToRemove })
    setTags(tags.filter(tag => tag.trim().toLowerCase() !== tagToRemove.trim().toLowerCase()))
  }

  return (
    <div className='w-full'>
      <div className='flex flex-wrap gap-2 p-2 border rounded-md min-h-10 focus-within:ring-2 focus-within:ring-ring'>
        {tags.map(tag => (
          <Badge key={tag} variant='secondary' className='flex items-center gap-1'>
            {tag}
            <button type='button' className='ml-1 p-0.5 rounded hover:bg-destructive/10' onClick={() => removeTag(tag)}>
              <X className='h-3 w-3 cursor-pointer hover:text-destructive' />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className='flex-1 min-w-[120px] outline-none bg-transparent'
          placeholder={tags.length > 0 ? '' : 'Add tags (comma separated)'}
        />
      </div>

      <p className='text-xs text-muted-foreground mt-1'>Press Enter or comma to add a label</p>
    </div>
  )
}
