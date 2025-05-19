'use client'

import { useEffect, useState } from 'react'
import { FilterPanel } from '@/components/dashboard/filter/panel'
import { type FilterOptions } from '@/components/dashboard/filter/dialog'
import { LinkList } from '@/components/dashboard/link-list'
import { Link } from '@/types/link'

interface LinksFilterClientProps {
  allLinks: Link[]
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

export function LinksFilterClient({ allLinks, availableTags }: LinksFilterClientProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    tags: [],
    dateRange: 'all',
    sort: 'newest',
  })

  const [links, setLinks] = useState<Link[]>(allLinks)
  const [loading, setLoading] = useState(false)
  const debouncedFilters = useDebouncedValue(filters, 400)

  useEffect(() => {
    const hasActiveFilters =
      filters.search !== '' ||
      (filters.tags && filters.tags.length > 0) ||
      (filters.dateRange && filters.dateRange !== 'all') ||
      (filters.sort && filters.sort !== 'newest')

    if (!hasActiveFilters) {
      setLinks(allLinks)
      return
    }

    setLoading(true)
    const params = new URLSearchParams({
      search: debouncedFilters.search,
      tags: debouncedFilters.tags.join(','),
      dateRange: debouncedFilters.dateRange,
      sort: debouncedFilters.sort ?? '',
    })
    fetch(`/api/links/filtered?${params}`)
      .then(res => res.json())
      .then(data => setLinks(data.links))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters, allLinks])

  return (
    <>
      <FilterPanel filters={filters} availableTags={availableTags} onFilterChange={setFilters} />
      {loading ? <div className='text-center py-8'>Loading...</div> : <LinkList links={links} />}
    </>
  )
}
