'use client'

import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'
import { FilterDialog, type FilterOptions } from '@/components/dashboard/filter/dialog'

interface FilterPanelProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  availableTags: string[]
}

export function FilterPanel({ filters, onFilterChange, availableTags }: FilterPanelProps) {
  const [search, setSearch] = useState(filters.search)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    setSearch(newSearch)

    // Actualizar inmediatamente el estado local
    const newFilters = { ...filters, search: newSearch }

    // Usar debounce solo para la llamada a la API
    debouncedOnFilterChange(newFilters)
  }

  // Mover el debounce al nivel del efecto que hace la llamada a la API
  const debouncedOnFilterChange = useDebouncedCallback((newFilters: FilterOptions) => {
    onFilterChange(newFilters)
  }, 400)

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
