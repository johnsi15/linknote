'use client'

import { usePathname } from 'next/navigation'
import { LinkCard } from '@/components/dashboard/link-card'
import { Link } from '@/types/link'

import { ReactNode } from 'react'

interface LinkListProps {
  links: Link[]
  children?: ReactNode
}

export function LinkList({ links, children }: LinkListProps) {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  if (!links || links.length === 0) {
    return <div className='text-center text-muted-foreground'>No links found</div>
  }

  return (
    <section
      className={`grid gap-6 ${
        isDashboard ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}
    >
      {links.map(({ id, title, url, description, tags, createdAt, isFavorite }) => (
        <LinkCard
          key={id}
          id={id}
          title={title}
          url={url}
          description={description ?? ''}
          tags={tags}
          createdAt={createdAt ? (typeof createdAt === 'string' ? createdAt : createdAt.toISOString()) : ''}
          isFavorite={isFavorite}
        />
      ))}
      {children}
    </section>
  )
}
