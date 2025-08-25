'use client'

import { usePathname } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export function LinkCardSkeleton() {
  return (
    <div className='overflow-hidden border rounded-lg'>
      <div className='p-6'>
        <div className='flex items-center justify-between space-y-0 pb-4'>
          <div className='space-y-1.5'>
            <div className='flex items-center'>
              <Skeleton className='mr-2 h-4 w-4 rounded-full' />
              <Skeleton className='h-5 w-40' />
            </div>
            <Skeleton className='h-4 w-64' />
          </div>
          <div className='flex space-x-1'>
            <Skeleton className='h-8 w-8 rounded-md' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </div>
        </div>

        <div className='space-y-2 py-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='h-4 w-4/6' />
        </div>

        <div className='mt-4 flex flex-wrap gap-2'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-6 w-16 rounded-full' />
          ))}
        </div>

        <div className='mt-4 flex items-center justify-between pt-4 border-t'>
          <Skeleton className='h-4 w-24' />
          <div className='flex space-x-2'>
            <Skeleton className='h-8 w-8 rounded-md' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LinkCardSkeletons({ count = 6 }: { count?: number }) {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  return (
    <div
      className={`grid gap-6 ${
        isDashboard ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <LinkCardSkeleton key={i} />
      ))}
    </div>
  )
}
