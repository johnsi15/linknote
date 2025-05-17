'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BookmarkIcon, PlusIcon, TagIcon, LayoutGridIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { NewLinkModal } from '@/components/dashboard/new-link/modal'

export function DashboardNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const [isNewLinkModalOpen, setIsNewLinkModalOpen] = useState(false)

  return (
    <>
      <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)}>
        <Link
          href='/dashboard'
          className={cn(
            'flex items-center text-sm font-medium transition-colors hover:text-primary',
            pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <LayoutGridIcon className='mr-2 h-4 w-4' />
          Dashboard
        </Link>
        <Link
          href='/dashboard/links'
          className={cn(
            'flex items-center text-sm font-medium transition-colors hover:text-primary',
            pathname.includes('/dashboard/links') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <BookmarkIcon className='mr-2 h-4 w-4' />
          My Links
        </Link>
        <Link
          href='/dashboard/tags'
          className={cn(
            'flex items-center text-sm font-medium transition-colors hover:text-primary',
            pathname.includes('/dashboard/tags') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <TagIcon className='mr-2 h-4 w-4' />
          Tags
        </Link>
        <Button variant='default' size='sm' className='flex items-center' onClick={() => setIsNewLinkModalOpen(true)}>
          <PlusIcon className='mr-2 h-4 w-4' />
          New Link
        </Button>
      </nav>

      <NewLinkModal isOpen={isNewLinkModalOpen} onClose={() => setIsNewLinkModalOpen(false)} />
    </>
  )
}
