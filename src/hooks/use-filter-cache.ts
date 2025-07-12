import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useLinks } from '@/hooks/queries/use-links'
import type { FilterOptions } from '@/components/dashboard/filter/dialog'

export function useFilterCache(initialFilters: FilterOptions) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [debouncedFilters] = useDebounce(filters, 400)

  // Convertir FilterOptions al formato que espera useLinks
  const queryFilters = {
    search: debouncedFilters.search || undefined,
    tags: debouncedFilters.tags.length > 0 ? debouncedFilters.tags : undefined,
    dateRange: debouncedFilters.dateRange !== 'all' ? debouncedFilters.dateRange : undefined,
    sort: debouncedFilters.sort !== 'newest' ? debouncedFilters.sort : undefined,
  }

  const { data, isLoading, error } = useLinks(queryFilters)

  return {
    filters,
    setFilters,
    links: data?.links || [],
    isLoading,
    error,
    total: data?.total || 0,
  }
}
