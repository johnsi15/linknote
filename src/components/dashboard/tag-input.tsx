'use client'

import { useState } from 'react'
import { X, Plus, SparklesIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
  placeholder?: string
  tags: string[]
  setTags?: (tags: string[]) => void
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      const updatedTags = [...tags]
      updatedTags.pop()
      updateTags(updatedTags)
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag]
      updateTags(newTags)
    }
    setInputValue('')
  }

  const removeTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index)
    updateTags(updatedTags)
  }

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag]
      updateTags(newTags)
    }
  }

  const updateTags = (newTags: string[]) => {
    if (setTags) setTags(newTags)
    if (onTagsChange) onTagsChange(newTags)
  }

  const filteredSuggestions = suggestedTags.filter(
    tag => !tags.includes(tag) && (!inputValue || tag.includes(inputValue.toLowerCase()))
  )

  return (
    <div className='space-y-2'>
      <div
        className={`flex flex-wrap gap-2 p-2 border rounded-md ${
          isInputFocused ? 'ring-2 ring-ring ring-offset-2' : ''
        }`}
      >
        {tags.map((tag, index) => (
          <Badge key={index} variant='secondary' className='gap-1 px-2 py-1'>
            {tag}
            <button
              type='button'
              onClick={() => removeTag(index)}
              className='text-muted-foreground ml-1 hover:text-foreground'
            >
              <X className='h-3 w-3' />
              <span className='sr-only'>Remove {tag}</span>
            </button>
          </Badge>
        ))}
        <div className='flex-1'>
          <input
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            className='w-full min-w-[120px] focus:outline-none bg-transparent'
            placeholder={tags.length === 0 ? placeholder : ''}
          />
        </div>
      </div>

      {suggestedTags.length > 0 && (
        <div className='border rounded-md p-3 bg-primary/5'>
          <div className='flex items-center gap-2 mb-2'>
            <SparklesIcon className='h-4 w-4 text-primary' />
            <p className='text-sm font-medium'>Suggested Tags</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {filteredSuggestions.map(tag => (
              <Badge
                key={tag}
                variant='outline'
                className='cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1'
                onClick={() => addSuggestedTag(tag)}
              >
                <Plus className='h-3 w-3' />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
