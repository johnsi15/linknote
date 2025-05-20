'use client'

import { KeyboardEvent, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
  placeholder?: string
  tags: string[]
  setTags: (tags: string[]) => void
  suggestedTags?: string[]
  onTagsChange?: (tags: string[]) => void
}

export function TagInput({
  placeholder = 'Add tag...',
  tags,
  setTags,
  suggestedTags = [],
  onTagsChange,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestedTags.filter(
    tag => tag.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(tag)
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Si el usuario escribe una coma, agregar el tag
    if (value.includes(',')) {
      const newTag = value.replace(',', '')
      addTag(newTag)
    } else {
      setInputValue(value)
      setShowSuggestions(true)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Agregar tag al presionar Enter o coma
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
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSuggestionClick = (tag: string) => {
    addTag(tag)
    inputRef.current?.focus()
  }

  return (
    <div className='w-full'>
      <div className='flex flex-wrap gap-2 p-2 border rounded-md min-h-10 focus-within:ring-2 focus-within:ring-ring'>
        {tags.map((tag, index) => (
          <Badge key={index} variant='secondary' className='flex items-center gap-1'>
            {tag}
            <X className='h-3 w-3 cursor-pointer hover:text-destructive' onClick={() => removeTag(tag)} />
          </Badge>
        ))}
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className='flex-1 min-w-[120px] outline-none bg-transparent'
          placeholder={tags.length > 0 ? '' : 'Agregar etiquetas (separadas por coma)'}
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className='mt-1 p-2 border rounded-md bg-background shadow-md max-h-40 overflow-y-auto'>
          {filteredSuggestions.map((tag, index) => (
            <div
              key={index}
              className='px-2 py-1 cursor-pointer hover:bg-accent rounded-sm'
              onClick={() => handleSuggestionClick(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      )}

      <p className='text-xs text-muted-foreground mt-1'>Press Enter or comma to add a label</p>
    </div>
  )
}
