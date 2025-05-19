'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FilterDialogProps {
  onFilterChange: (filters: FilterOptions) => void
  availableTags: string[]
  currentFilters: FilterOptions
}

export interface FilterOptions {
  search: string
  tags: string[]
  dateRange: 'all' | 'today' | 'week' | 'month'
  sort?: 'newest' | 'oldest' | 'az' | 'za'
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export function FilterDialog({ onFilterChange, availableTags, currentFilters }: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters)
  const [search, setSearch] = useState(filters.search)
  const debouncedSearch = useDebouncedValue(search, 400)

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      const newFilters = { ...filters, search: debouncedSearch }
      setFilters(newFilters)
      onFilterChange(newFilters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag) ? filters.tags.filter(t => t !== tag) : [...filters.tags, tag]

    const newFilters = { ...filters, tags: newTags }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDateRangeChange = (range: FilterOptions['dateRange']) => {
    const newFilters = { ...filters, dateRange: range }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const newFilters = {
      search: '',
      tags: [],
      dateRange: 'all' as const,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const hasActiveFilters = filters.search || filters.tags.length > 0 || filters.dateRange !== 'all'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <Filter className='h-4 w-4' />
          Filter
          {hasActiveFilters && (
            <Badge variant='secondary' className='ml-1'>
              {filters.tags.length + (filters.search ? 1 : 0) + (filters.dateRange !== 'all' ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Filter Links</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>Search</Label>
            <Input placeholder='Search in title and description...' value={search} onChange={handleSearchChange} />
          </div>

          <div className='space-y-2'>
            <Label>Date Range</Label>
            <div className='flex flex-wrap gap-2'>
              {['all', 'today', 'week', 'month'].map(range => (
                <Button
                  key={range}
                  size='sm'
                  variant={filters.dateRange === range ? 'default' : 'outline'}
                  onClick={() => handleDateRangeChange(range as FilterOptions['dateRange'])}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Tags</Label>
            <ScrollArea className='h-[200px] rounded-md border p-2'>
              <div className='flex flex-wrap gap-2'>
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                    className='cursor-pointer'
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          {hasActiveFilters && (
            <Button variant='ghost' className='w-full gap-2' onClick={clearFilters}>
              <X className='h-4 w-4' />
              Clear all filters
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
