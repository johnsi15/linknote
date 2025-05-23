'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { LinkForm } from '@/components/dashboard/link-form'
import { saveLink } from '@/actions/links'
import { LinkFormData } from '@/types/link'

interface NewLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewLinkModal({ isOpen, onClose }: NewLinkModalProps) {
  const router = useRouter()
  const [linkId, setLinkId] = useState<string | undefined>(undefined)

  const handleSubmit = async (formData: LinkFormData, isAutoSaveEvent = false) => {
    const safeFormData = {
      ...formData,
      description: formData.description ?? '',
    }

    const isActualUpdateForBackend = Boolean(linkId)
    const result = await saveLink(safeFormData, isActualUpdateForBackend, linkId)

    if (result.success) {
      if (result.linkId) {
        setLinkId(result.linkId)
      }

      if (isAutoSaveEvent) {
        toast.success('Enlace guardado automáticamente')
        router.refresh()
      } else {
        toast.success(isActualUpdateForBackend ? 'Enlace actualizado' : 'Enlace creado', {
          description: 'El enlace se ha guardado correctamente',
        })
        onClose()
      }

      return result
    } else {
      toast.error('Error', { description: result.error || 'No se pudo crear el enlace' })
      return { success: false, error: result.error || 'Error desconocido' }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Link</DialogTitle>
          <DialogDescription>Añade información sobre el link que quieres guardar.</DialogDescription>
        </DialogHeader>

        <LinkForm onSubmit={handleSubmit} autoSave={true} />
      </DialogContent>
    </Dialog>
  )
}
