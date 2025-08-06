'use client'

import { useEffect } from 'react'
import { useFilterCache } from '@/hooks/use-filter-cache'
import { useOfflineLinknote } from '@/hooks/use-offline-linknote'
import { FilterPanel } from '@/components/dashboard/filter/panel'
import { type FilterOptions } from '@/components/dashboard/filter/dialog'
import { LinkList } from '@/components/dashboard/link-list'
import { LinkCardSkeletons } from '@/components/ui/skeleton/link-card-skeleton'

interface LinksFilterClientProps {
  initialFilters: FilterOptions
  availableTags: string[]
}

export function LinksFilterClient({ initialFilters, availableTags }: LinksFilterClientProps) {
  const { filters, setFilters, links: onlineLinks, isLoading: onlineLoading, error } = useFilterCache(initialFilters)

  const offline = useOfflineLinknote()

  const filteredOfflineLinks = offline.links.filter(link => {
    if (
      filters.search &&
      !link.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !link.url.toLowerCase().includes(filters.search.toLowerCase()) &&
      !link.description?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    if (filters.tags.length > 0) {
      return filters.tags.some(tag => link.tags.includes(tag))
    }

    return true
  })

  const displayLinks = offline.isOnline && onlineLinks?.length > 0 ? onlineLinks : filteredOfflineLinks
  const isLoading = offline.isOnline ? onlineLoading : offline.isLoading

  useEffect(() => {
    if (offline.isOnline && offline.syncStatus.pendingItems > 0) {
      offline.sync.syncAll()
    }
  }, [offline.isOnline, offline.syncStatus.pendingItems, offline.sync])

  return (
    <>
      <FilterPanel filters={filters} availableTags={availableTags} onFilterChange={setFilters} />

      {offline.syncStatus.pendingItems > 0 && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700'>
          {offline.isOnline
            ? `Sincronizando ${offline.syncStatus.pendingItems} cambios...`
            : `${offline.syncStatus.pendingItems} cambios pendientes de sincronización`}
        </div>
      )}

      {isLoading ? (
        <LinkCardSkeletons count={6} />
      ) : error && offline.isOnline ? (
        <div className='text-center py-8 text-red-500'>Error al cargar los enlaces</div>
      ) : displayLinks.length > 0 ? (
        <LinkList links={displayLinks} />
      ) : (
        <div className='text-center py-8 text-muted-foreground'>
          {filters.search || filters.tags.length > 0
            ? 'No se encontraron enlaces con los filtros seleccionados'
            : 'No tienes enlaces guardados aún'}
        </div>
      )}
    </>
  )
}
