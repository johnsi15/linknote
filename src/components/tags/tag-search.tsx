'use client'

import { useQueryState, parseAsString } from 'nuqs'
import { Input } from '@/components/ui/input'
import React, { useCallback, useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

export function TagSearch() {
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''))
  const [inputValue, setInputValue] = useState(search)
  const [debouncedValue] = useDebounce(inputValue, 400)

  // Sincroniza el valor debounciado con la query string
  useEffect(() => {
    setSearch(debouncedValue)
  }, [debouncedValue, setSearch])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  useEffect(() => {
    setInputValue(search)
  }, [search])

  return (
    <Input
      type='text'
      placeholder='Search tags...'
      value={inputValue}
      onChange={handleChange}
      className='w-full mb-2'
      autoFocus={false}
    />
  )
}
