'use client'

import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { FilterPanel } from '@/components/dashboard/filter/panel'
import { type FilterOptions } from '@/components/dashboard/filter/dialog'
import { LinkList } from '@/components/dashboard/link-list'
import { Link } from '@/types/link'
import { LinkCardSkeletons } from '@/components/ui/skeleton/link-card-skeleton'

interface LinksFilterClientProps {
  allLinks: Link[]
  availableTags: string[]
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

  const fetchFilteredLinks = useDebouncedCallback((currentFilters: FilterOptions) => {
    const hasActiveFilters =
      currentFilters.search !== '' ||
      (currentFilters.tags && currentFilters.tags.length > 0) ||
      (currentFilters.dateRange && currentFilters.dateRange !== 'all') ||
      (currentFilters.sort && currentFilters.sort !== 'newest')

    if (!hasActiveFilters) {
      setLinks(allLinks)
      return
    }

    setLoading(true)
    const params = new URLSearchParams({
      search: currentFilters.search,
      tags: currentFilters.tags.join(','),
      dateRange: currentFilters.dateRange,
      sort: currentFilters.sort ?? '',
    })

    fetch(`/api/links/filtered?${params}`)
      .then(res => res.json())
      .then(data => setLinks(data.links))
      .finally(() => setLoading(false))
  }, 400)

  useEffect(() => {
    fetchFilteredLinks(filters)
  }, [filters, allLinks, fetchFilteredLinks])

  return (
    <>
      <FilterPanel filters={filters} availableTags={availableTags} onFilterChange={setFilters} />
      {loading ? (
        <LinkCardSkeletons count={6} />
      ) : links.length > 0 ? (
        <LinkList links={links} />
      ) : (
        <div className='text-center py-8 text-muted-foreground'>
          No se encontraron enlaces con los filtros seleccionados
        </div>
      )}
    </>
  )
}
