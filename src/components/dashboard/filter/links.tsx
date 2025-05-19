'use client'

import { useState } from 'react'
import { FilterPanel } from '@/components/dashboard/filter/panel'
import { type FilterOptions } from '@/components/dashboard/filter/dialog'
import { LinkList } from '@/components/dashboard/link-list'
import { Link } from '@/types/link'

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

  // const filteredLinks = allLinks.filter(link => {
  //   const matchesTags = filters?.tags?.every(tag => link.tags.includes(tag)) ?? true
  //   const matchesSearch = filters?.search
  //     ? link.title.toLowerCase().includes(filters.search.toLowerCase()) ||
  //       link.description?.toLowerCase().includes(filters.search.toLowerCase())
  //     : true
  //   return matchesTags && matchesSearch
  // })

  const now = new Date()
  const filteredLinks = allLinks.filter(link => {
    const matchesTags = filters?.tags?.every(tag => link.tags.includes(tag)) ?? true
    const matchesSearch = filters?.search
      ? link.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        link.description?.toLowerCase().includes(filters.search.toLowerCase())
      : true

    let matchesDate = true
    if (filters.dateRange && filters.dateRange !== 'all') {
      const createdAt = new Date(link.createdAt ?? '')
      switch (filters.dateRange) {
        case 'today':
          matchesDate = createdAt.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now)
          weekAgo.setDate(now.getDate() - 7)
          matchesDate = createdAt >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now)
          monthAgo.setMonth(now.getMonth() - 1)
          matchesDate = createdAt >= monthAgo
          break
      }
    }

    return matchesTags && matchesSearch && matchesDate
  })

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    switch (filters.sort) {
      case 'newest':
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      case 'oldest':
        return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
      case 'az':
        return a.title.localeCompare(b.title)
      case 'za':
        return b.title.localeCompare(a.title)
      default:
        return 0
    }
  })

  return (
    <>
      <FilterPanel filters={filters} availableTags={availableTags} onFilterChange={setFilters} />
      <LinkList links={sortedLinks} />
    </>
  )
}
