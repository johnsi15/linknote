'use client'

import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function NewLinkButton() {
  const router = useRouter()

  return (
    <>
      <Button className='gap-2' onClick={() => router.push('/links/new')}>
        <PlusIcon className='h-4 w-4' />
        Add Link
      </Button>
    </>
  )
}
