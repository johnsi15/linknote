'use client'

import { KeyboardEvent, useRef, useState, useEffect } from 'react'
import { X, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSimilarTags, type SimilarTag } from '@/hooks/mutations/use-tag-embeddings'
import { useDebounce } from 'use-debounce'
import { cn } from '@/lib/utils'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({ tags, setTags, placeholder = 'Add tags...', className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Debounce del input para evitar muchas consultas
  const [debouncedInputValue] = useDebounce(inputValue, 300)

  // Hook para buscar tags similares usando query con cache
  const { data: similarTagsData, isLoading: isPending } = useSimilarTags(
    debouncedInputValue,
    5,
    debouncedInputValue.trim().length > 1
  )

  // Mostrar sugerencias cuando haya datos
  useEffect(() => {
    if (debouncedInputValue.trim().length > 1 && similarTagsData && similarTagsData.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
    setSelectedIndex(-1)
  }, [debouncedInputValue, similarTagsData])

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim()
    if (trimmedTag && !tags.map(t => t.toLowerCase()).includes(trimmedTag.toLowerCase())) {
      setTags([...tags, trimmedTag])
    }

    setInputValue('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag.trim().toLowerCase() !== tagToRemove.trim().toLowerCase()))
  }

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
    const suggestionOptions = getSuggestionOptions()

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (showSuggestions && suggestionOptions.length > 0) {
        setSelectedIndex(prev => (prev + 1) % suggestionOptions.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (showSuggestions && suggestionOptions.length > 0) {
        setSelectedIndex(prev => (prev <= 0 ? suggestionOptions.length - 1 : prev - 1))
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (showSuggestions && selectedIndex >= 0 && suggestionOptions[selectedIndex]) {
        addTag(suggestionOptions[selectedIndex])
      } else if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const getSuggestionOptions = () => {
    const similarTags = similarTagsData || []
    const filteredSimilarTags = similarTags.filter(
      (tag: SimilarTag) =>
        !tags.map(t => t.toLowerCase()).includes(tag.tagName.toLowerCase()) &&
        tag.tagName.toLowerCase() !== inputValue.toLowerCase()
    )

    const options = []
    if (inputValue.trim()) {
      options.push(inputValue.trim())
    }
    filteredSimilarTags.forEach((tag: SimilarTag) => options.push(tag.tagName))

    return options
  }

  const isExistingTag = (tagName: string) => {
    const similarTags = similarTagsData || []
    return similarTags.some((tag: SimilarTag) => tag.tagName.toLowerCase() === tagName.toLowerCase())
  }

  // Filtrar tags similares que no estén ya agregados
  const similarTags = similarTagsData || []
  const filteredSimilarTags = similarTags.filter(
    (tag: SimilarTag) =>
      !tags.map(t => t.toLowerCase()).includes(tag.tagName.toLowerCase()) &&
      tag.tagName.toLowerCase() !== inputValue.toLowerCase()
  )

  return (
    <div className={cn('relative w-full', className)}>
      {/* Input container con tags dentro */}
      <div
        className={cn(
          'w-full flex flex-wrap gap-1 p-2 border rounded-md min-h-10 focus-within:ring-2 focus-within:ring-ring cursor-text',
          'bg-background'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Tags dentro del input */}
        {tags.map(tag => (
          <Badge key={tag} variant='secondary' className='px-2 py-1 text-xs'>
            <Tag className='w-3 h-3 mr-1' />
            {tag}
            <Button
              variant='ghost'
              size='sm'
              className='ml-1 h-auto p-0 text-muted-foreground hover:text-foreground'
              onClick={e => {
                e.stopPropagation()
                removeTag(tag)
              }}
              type='button'
            >
              <X className='w-3 h-3' />
            </Button>
          </Badge>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.trim().length > 1 && setShowSuggestions(true)}
          onBlur={() => {
            // Delay para permitir clicks en sugerencias
            setTimeout(() => setShowSuggestions(false), 150)
          }}
          className='flex-1 min-w-[120px] w-full outline-none bg-transparent text-sm'
          placeholder={tags.length > 0 ? '' : placeholder}
        />

        <Tag className='w-4 h-4 text-muted-foreground self-center flex-shrink-0' />
      </div>

      {/* Sugerencias dropdown */}
      {showSuggestions && (inputValue.trim() || filteredSimilarTags.length > 0) && (
        <div className='absolute z-50 w-full bottom-full mb-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto'>
          {isPending && (
            <div className='p-3 text-sm text-muted-foreground text-center'>Searching for similar tags...</div>
          )}

          {!isPending && (
            <div className='py-1'>
              {/* Opción para crear el tag actual */}
              {inputValue.trim() && (
                <div
                  ref={el => {
                    suggestionRefs.current[0] = el
                  }}
                  className={cn(
                    'px-3 py-2 cursor-pointer hover:bg-accent text-sm flex items-center justify-between',
                    selectedIndex === 0 && 'bg-accent'
                  )}
                  onClick={() => addTag(inputValue)}
                >
                  <div className='flex items-center'>
                    <Tag className='w-4 h-4 mr-2' />
                    {isExistingTag(inputValue) ? `Add "${inputValue}"` : `Create "${inputValue}"`}
                  </div>
                  <Badge variant={isExistingTag(inputValue) ? 'default' : 'outline'} className='text-xs'>
                    {isExistingTag(inputValue) ? 'Exists' : 'New'}
                  </Badge>
                </div>
              )}

              {/* Tags similares sugeridos */}
              {filteredSimilarTags.map((tag: SimilarTag, index: number) => {
                const adjustedIndex = inputValue.trim() ? index + 1 : index
                return (
                  <div
                    key={tag.tagId}
                    ref={el => {
                      suggestionRefs.current[adjustedIndex] = el
                    }}
                    className={cn(
                      'px-3 py-2 cursor-pointer hover:bg-accent text-sm flex items-center justify-between',
                      selectedIndex === adjustedIndex && 'bg-accent'
                    )}
                    onClick={() => addTag(tag.tagName)}
                  >
                    <div className='flex items-center'>
                      <Tag className='w-4 h-4 mr-2' />
                      {tag.tagName}
                    </div>
                    <Badge variant='secondary' className='text-xs'>
                      {Math.round(tag.similarity * 100)}%
                    </Badge>
                  </div>
                )
              })}

              {!isPending && filteredSimilarTags.length === 0 && !inputValue.trim() && (
                <div className='p-3 text-sm text-muted-foreground text-center'>Type to search for similar tags</div>
              )}
            </div>
          )}
        </div>
      )}

      <p className='text-xs text-muted-foreground mt-1'>Press Enter or comma to add a tag</p>
    </div>
  )
}
