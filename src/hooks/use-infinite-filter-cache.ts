import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useInfiniteLinks } from '@/hooks/queries/use-links'
import type { FilterOptions } from '@/components/dashboard/filter/dialog'

export function useInfiniteFilterCache(initialFilters: FilterOptions) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [debouncedFilters] = useDebounce(filters, 400)

  // Convertir FilterOptions al formato que espera useInfiniteLinks
  const queryFilters = {
    search: debouncedFilters.search || undefined,
    tags: debouncedFilters.tags.length > 0 ? debouncedFilters.tags.join(',') : undefined,
    dateRange: debouncedFilters.dateRange !== 'all' ? debouncedFilters.dateRange : undefined,
    sort: debouncedFilters.sort !== 'newest' ? debouncedFilters.sort : undefined,
  }

  const infiniteQuery = useInfiniteLinks(queryFilters)

  return {
    filters,
    setFilters,
    ...infiniteQuery, // data, isLoading, fetchNextPage, hasNextPage, etc.
  }
}
