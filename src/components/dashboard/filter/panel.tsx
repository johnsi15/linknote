'use client'

import { useEffect, useState } from 'react'
import { useQueryState, parseAsString } from 'nuqs'
import { Input } from '@/components/ui/input'
import { FilterDialog } from '@/components/dashboard/filter/dialog'
import { useDebounce } from 'use-debounce'

interface FilterPanelProps {
  availableTags: string[]
}

export function FilterPanel({ availableTags }: FilterPanelProps) {
  const [search, setSearch] = useQueryState('search', { defaultValue: '' })
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('newest'))
  const [inputValue, setInputValue] = useState(search)
  const [debouncedValue] = useDebounce(inputValue, 400)

  useEffect(() => {
    setSearch(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  useEffect(() => {
    setInputValue(search)
  }, [search])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <div className='col-span-2'>
        <Input placeholder='Search links...' value={inputValue} onChange={handleSearchChange} />
      </div>
      <div className='flex space-x-2'>
        <FilterDialog availableTags={availableTags} />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        >
          <option value='newest'>Newest first</option>
          <option value='oldest'>Oldest first</option>
          <option value='az'>A-Z</option>
          <option value='za'>Z-A</option>
        </select>
      </div>
    </div>
  )
}
