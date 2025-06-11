'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BookmarkIcon, PlusIcon, TagIcon, LayoutGridIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function DashboardNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)}>
        <Link href='/' className='flex items-center text-sm font-medium transition-colors hover:text-primary'>
          Linknote
        </Link>
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
          href='/links'
          className={cn(
            'flex items-center text-sm font-medium transition-colors hover:text-primary',
            pathname.includes('/links') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <BookmarkIcon className='mr-2 h-4 w-4' />
          My Links
        </Link>
        <Link
          href='/tags'
          className={cn(
            'flex items-center text-sm font-medium transition-colors hover:text-primary',
            pathname.includes('/tags') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <TagIcon className='mr-2 h-4 w-4' />
          Tags
        </Link>
        <Button
          variant='default'
          size='sm'
          className='flex items-center mr-3'
          onClick={() => router.push('/links/new')}
        >
          <PlusIcon className='mr-2 h-4 w-4' />
          New Link
        </Button>
        <span
          className='ml-auto flex items-center justify-center h-8 flex-shrink-0 rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground border border-neutral-200 dark:border-neutral-800'
          title='Open command palette'
        >
          <span className='hidden sm:inline'>⌘</span>K
        </span>
      </nav>
    </>
  )
}
