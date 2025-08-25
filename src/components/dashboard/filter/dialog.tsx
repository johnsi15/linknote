'use client'

import { Filter, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useQueryState, parseAsString } from 'nuqs'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

export interface FilterOptions {
  search: string
  tags: string[]
  dateRange: 'all' | 'today' | 'week' | 'month'
  sort?: 'newest' | 'oldest' | 'az' | 'za'
}

interface FilterDialogProps {
  availableTags: string[]
}

export function FilterDialog({ availableTags }: FilterDialogProps) {
  const [search, setSearch] = useQueryState('search', { defaultValue: '' })
  const [tags, setTags] = useQueryState('tags', { defaultValue: '' })
  const [dateRange, setDateRange] = useQueryState('dateRange', parseAsString.withDefault('all'))

  const [inputValue, setInputValue] = useState(search)
  const [debouncedValue] = useDebounce(inputValue, 400)

  const tagsArray = tags ? tags.split(',') : []

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

  const toggleTag = (tag: string) => {
    const newTags = tagsArray.includes(tag) ? tagsArray.filter(t => t !== tag) : [...tagsArray, tag]
    setTags(newTags.length > 0 ? newTags.join(',') : '')
  }

  const handleDateRangeChange = (range: FilterOptions['dateRange']) => {
    setDateRange(range)
  }

  const clearFilters = () => {
    setSearch('')
    setTags('')
    setDateRange('all')
  }

  const hasActiveFilters = search || tagsArray.length > 0 || dateRange !== 'all'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <Filter className='h-4 w-4' />
          Filter
          {hasActiveFilters && (
            <Badge variant='secondary' className='ml-1'>
              {tagsArray.length + (search ? 1 : 0) + (dateRange !== 'all' ? 1 : 0)}
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
            <Input placeholder='Search in title and description...' value={inputValue} onChange={handleSearchChange} />
          </div>

          <div className='space-y-2'>
            <Label>Date Range</Label>
            <div className='flex flex-wrap gap-2'>
              {['all', 'today', 'week', 'month'].map(range => (
                <Button
                  key={range}
                  size='sm'
                  variant={dateRange === range ? 'default' : 'outline'}
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
                    variant={tagsArray.includes(tag) ? 'default' : 'outline'}
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
