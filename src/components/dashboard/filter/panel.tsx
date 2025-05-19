'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { FilterDialog, type FilterOptions } from '@/components/dashboard/filter/dialog'

interface FilterPanelProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  availableTags: string[]
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export function FilterPanel({ filters, onFilterChange, availableTags }: FilterPanelProps) {
  const [search, setSearch] = useState(filters.search)
  const debouncedSearch = useDebouncedValue(search, 400)

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ ...filters, search: debouncedSearch })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sort: e.target.value as FilterOptions['sort'] })
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <div className='col-span-2'>
        <Input placeholder='Search links...' value={search} onChange={handleSearchChange} />
      </div>
      <div className='flex space-x-2'>
        <FilterDialog currentFilters={filters} availableTags={availableTags} onFilterChange={onFilterChange} />
        <select
          value={filters.sort || ''}
          onChange={handleSortChange}
          className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        >
          <option value=''>Sort by</option>
          <option value='newest'>Newest first</option>
          <option value='oldest'>Oldest first</option>
          <option value='az'>A-Z</option>
          <option value='za'>Z-A</option>
        </select>
      </div>
    </div>
  )
}
