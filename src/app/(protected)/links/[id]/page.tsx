'use client'

import { useParams, useRouter } from 'next/navigation'
import { LinkCard } from '@/components/dashboard/link-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, PencilIcon } from 'lucide-react'
import Link from 'next/link'
import { getLinkById, deleteLink } from '@/actions/links'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LinkForm } from '@/components/dashboard/link-form'

export default function LinkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [linkData, setLinkData] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchLinkData() {
      setIsLoading(true)
      const result = await getLinkById(id)
      console.log({ result })

      if (result.success) {
        setLinkData(result.link)
      } else {
        toast.error('Error', { description: result.error })
        router.push('/dashboard')
      }

      setIsLoading(false)
    }

    fetchLinkData()
  }, [id, router])

  const handleUpdate = async (formData: any, isAutoSaveEvent = false) => {
    try {
      const result = await fetch(`/api/links/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }).then(res => res.json())

      if (result.success) {
        if (!isAutoSaveEvent) {
          toast.success('Enlace actualizado', { description: 'El enlace se ha actualizado correctamente' })
          setIsEditModalOpen(false)
        }

        // Actualizar los datos locales
        const updatedLink = await getLinkById(id)
        if (updatedLink.success) {
          setLinkData(updatedLink.link)
        }

        return { success: true, linkId: id }
      } else {
        toast.error('Error', { description: result.error })
        return { success: false, error: result.error || 'Error desconocido' }
      }
    } catch (error) {
      console.error('Error al actualizar enlace:', error)
      toast.error('Error', { description: 'No se pudo actualizar el enlace' })
      return { success: false, error: 'Error al actualizar el enlace' }
    }
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este enlace?')) {
      setIsDeleting(true)
      const result = await deleteLink(id)

      if (result.success) {
        toast.success('Enlace eliminado', { description: 'El enlace se ha eliminado correctamente' })
        router.push('/dashboard')
      } else {
        toast.error('Error', { description: result.error })
        setIsDeleting(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Link href='/dashboard'>
            <Button variant='ghost' size='sm' className='gap-1'>
              <ArrowLeft className='h-4 w-4' />
              Volver
            </Button>
          </Link>
          <h1 className='text-2xl font-bold'>Detalles del enlace</h1>
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setIsEditModalOpen(true)}>
            <PencilIcon className='h-4 w-4 mr-2' />
            Editar
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
            Eliminar
          </Button>
        </div>
      </div>

      <LinkCard
        id={id}
        title={linkData.title}
        url={linkData.url}
        description={linkData.description || ''}
        tags={linkData.tags || []}
        createdAt={linkData.createdAt}
      />

      {/* Modal de edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Editar Enlace</DialogTitle>
          </DialogHeader>
          <LinkForm
            defaultValues={{
              title: linkData.title,
              url: linkData.url,
              description: linkData.description || '',
              tags: linkData.tags || [],
            }}
            onSubmit={handleUpdate}
            autoSave={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
