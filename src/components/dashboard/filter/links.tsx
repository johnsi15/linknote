'use client'

import { useFilterCache } from '@/hooks/use-filter-cache'
import { FilterPanel } from '@/components/dashboard/filter/panel'
import { type FilterOptions } from '@/components/dashboard/filter/dialog'
import { LinkList } from '@/components/dashboard/link-list'
import { LinkCardSkeletons } from '@/components/ui/skeleton/link-card-skeleton'

interface LinksFilterClientProps {
  initialFilters: FilterOptions
  availableTags: string[]
}

export function LinksFilterClient({ initialFilters, availableTags }: LinksFilterClientProps) {
  const { filters, setFilters, links, isLoading, error } = useFilterCache(initialFilters)

  return (
    <>
      <FilterPanel filters={filters} availableTags={availableTags} onFilterChange={setFilters} />
      {isLoading ? (
        <LinkCardSkeletons count={6} />
      ) : error ? (
        <div className='text-center py-8 text-red-500'>Error al cargar los enlaces</div>
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
