'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import NewLinkForm from '@/components/dashboard/new-link/form'

interface NewLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewLinkModal({ isOpen, onClose }: NewLinkModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Link</DialogTitle>
          <DialogDescription>Añade información sobre el link que quieres guardar.</DialogDescription>
        </DialogHeader>
        <NewLinkForm onCancel={onClose} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  )
}
