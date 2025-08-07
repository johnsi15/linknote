'use client'

import { useEffect, useRef } from 'react'
import { useOfflineLinknote } from '@/hooks/use-offline-linknote'
import { useInfiniteFilterCache } from '@/hooks/use-infinite-filter-cache'
import { FilterPanel } from '@/components/dashboard/filter/panel'
import { type FilterOptions } from '@/components/dashboard/filter/dialog'
import { LinkList } from '@/components/dashboard/link-list'
import { LinkCardSkeleton, LinkCardSkeletons } from '@/components/ui/skeleton/link-card-skeleton'

interface LinksFilterClientProps {
  initialFilters: FilterOptions
  availableTags: string[]
}

export function LinksFilterClient({ initialFilters, availableTags }: LinksFilterClientProps) {
  const { filters, data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, error } =
    useInfiniteFilterCache(initialFilters)
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

  const links = data?.pages.flatMap(page => page.links) || []
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!offline.isOnline || !hasNextPage || isFetchingNextPage) return

    const observer = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) fetchNextPage()
    })

    const node = loadMoreRef.current

    if (node) observer.observe(node)

    return () => {
      if (node) observer.unobserve(node)
    }
  }, [offline.isOnline, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (offline.isOnline && offline.syncStatus.pendingItems > 0) {
      offline.sync.syncAll()
    }
  }, [offline.isOnline, offline.syncStatus.pendingItems, offline.sync])

  return (
    <>
      <FilterPanel availableTags={availableTags} />

      {offline.syncStatus.pendingItems > 0 && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700'>
          {offline.isOnline
            ? `Sincronizando ${offline.syncStatus.pendingItems} cambios...`
            : `${offline.syncStatus.pendingItems} cambios pendientes de sincronización`}
        </div>
      )}

      {offline.isOnline ? (
        isLoading && !links.length ? (
          <LinkCardSkeletons count={6} />
        ) : error ? (
          <div className='text-center py-8 text-red-500'>Error al cargar los enlaces</div>
        ) : links.length > 0 ? (
          <>
            <LinkList links={links}>
              {isFetchingNextPage && Array.from({ length: 3 }).map((_, i) => <LinkCardSkeleton key={i} />)}
            </LinkList>
            <div ref={loadMoreRef} />
          </>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            {filters.search || filters.tags.length > 0
              ? 'No se encontraron enlaces con los filtros seleccionados'
              : 'No tienes enlaces guardados aún'}
          </div>
        )
      ) : filteredOfflineLinks.length > 0 ? (
        <LinkList links={filteredOfflineLinks} />
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
