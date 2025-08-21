'use client'

import { KeyboardEvent, useRef, useState, useEffect } from 'react'
import { X, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLazySimilarTags } from '@/hooks/mutations/use-tag-embeddings'
import { useDebounce } from 'use-debounce'
import { cn } from '@/lib/utils'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({ tags, setTags, placeholder = "Agregar tags...", className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Debounce del input para evitar muchas consultas
  const [debouncedInputValue] = useDebounce(inputValue, 300)
  
  // Hook para buscar tags similares
  const { mutate: findSimilarTags, data: similarTagsData, isPending } = useLazySimilarTags()

  // Buscar tags similares cuando el usuario escriba
  useEffect(() => {
    if (debouncedInputValue.trim() && debouncedInputValue.length > 1) {
      findSimilarTags({
        tagName: debouncedInputValue,
        limit: 5
      })
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [debouncedInputValue, findSimilarTags])

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim()
    if (trimmedTag && !tags.map(t => t.toLowerCase()).includes(trimmedTag.toLowerCase())) {
      setTags([...tags, trimmedTag])
    }
    setInputValue('')
    setIsOpen(false)
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
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Filtrar tags similares que no estén ya agregados
  const similarTags = similarTagsData?.similarTags || []
  const filteredSimilarTags = similarTags.filter(
    tag => !tags.map(t => t.toLowerCase()).includes(tag.tagName.toLowerCase()) && 
           tag.tagName.toLowerCase() !== inputValue.toLowerCase()
  )

  return (
    <div className={cn("space-y-2", className)}>
      {/* Tags ya agregados */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-2 py-1">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeTag(tag)}
                type="button"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input con autocompletado */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className='w-full'>
            <div className='flex flex-wrap gap-2 p-2 border rounded-md min-h-10 focus-within:ring-2 focus-within:ring-ring'>
              <input
                ref={inputRef}
                type='text'
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className='flex-1 min-w-[120px] outline-none bg-transparent'
                placeholder={tags.length > 0 ? '' : placeholder}
              />
              <Tag className="w-4 h-4 text-muted-foreground self-center" />
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandList>
              {isPending && (
                <CommandEmpty>Buscando tags similares...</CommandEmpty>
              )}
              
              {!isPending && filteredSimilarTags.length === 0 && inputValue.trim() && (
                <CommandEmpty>
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      No se encontraron tags similares
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(inputValue)}
                      type="button"
                    >
                      Crear &quot;{inputValue}&quot;
                    </Button>
                  </div>
                </CommandEmpty>
              )}

              {filteredSimilarTags.length > 0 && (
                <CommandGroup heading="Tags similares">
                  {/* Opción para crear el tag actual */}
                  {inputValue.trim() && (
                    <CommandItem
                      onSelect={() => addTag(inputValue)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Crear &quot;{inputValue}&quot;
                      </div>
                      <Badge variant="outline" className="ml-2">Nuevo</Badge>
                    </CommandItem>
                  )}
                  
                  {/* Tags similares sugeridos */}
                  {filteredSimilarTags.map((tag) => (
                    <CommandItem
                      key={tag.tagId}
                      onSelect={() => addTag(tag.tagName)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        {tag.tagName}
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {Math.round(tag.similarity * 100)}%
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className='text-xs text-muted-foreground'>Press Enter o comma to add a tag</p>
    </div>
  )
}
