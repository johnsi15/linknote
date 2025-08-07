import { useState } from 'react'
import { useInfiniteLinks } from '@/hooks/queries/use-links'
import type { FilterOptions } from '@/components/dashboard/filter/dialog'

export function useInfiniteFilterCache(initialFilters: FilterOptions) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)

  const infiniteQuery = useInfiniteLinks()

  return {
    filters,
    setFilters,
    ...infiniteQuery, // data, isLoading, fetchNextPage, hasNextPage, etc.
  }
}
