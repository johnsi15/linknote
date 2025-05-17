'use client'

import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewLinkModal } from '@/components/dashboard/new-link/modal'

export function NewLinkButton() {
  const [isNewLinkModalOpen, setIsNewLinkModalOpen] = useState(false)

  return (
    <>
      <Button className='gap-2' onClick={() => setIsNewLinkModalOpen(true)}>
        <PlusIcon className='h-4 w-4' />
        Add Link
      </Button>

      <NewLinkModal isOpen={isNewLinkModalOpen} onClose={() => setIsNewLinkModalOpen(false)} />
    </>
  )
}
