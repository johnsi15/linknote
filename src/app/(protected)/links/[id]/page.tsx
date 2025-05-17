'use client'

import { useParams, useRouter } from 'next/navigation'
import { LinkCard } from '@/components/dashboard/link-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getLinkById, updateLink, deleteLink } from '@/actions/links'
import { toast } from 'sonner'
import { LinkForm } from '@/components/dashboard/link-form'
import { useEffect, useState } from 'react'

export default function LinkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [linkData, setLinkData] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchLinkData() {
      setIsLoading(true)
      const result = await getLinkById(id)

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

  const handleUpdate = async (formData: any) => {
    const result = await updateLink(id, formData)

    if (result.success) {
      toast.success('Enlace actualizado', { description: 'El enlace se ha actualizado correctamente' })
      setIsEditing(false)

      // Actualizar los datos locales
      const updatedLink = await getLinkById(id)
      if (updatedLink.success) {
        setLinkData(updatedLink.link)
      }
    } else {
      toast.error('Error', { description: result.error })
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
          <h1 className='text-2xl font-bold'>{isEditing ? 'Editar enlace' : 'Detalles del enlace'}</h1>
        </div>

        <div className='flex gap-2'>
          {!isEditing ? (
            <>
              <Button variant='outline' onClick={() => setIsEditing(true)}>
                Editar
              </Button>
              <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
                Eliminar
              </Button>
            </>
          ) : (
            <Button variant='outline' onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <LinkForm
          defaultValues={{
            title: linkData.title,
            url: linkData.url,
            description: linkData.description || '',
            tags: linkData.tags || [],
          }}
          onSubmit={handleUpdate}
        />
      ) : (
        <LinkCard
          id={id}
          title={linkData.title}
          url={linkData.url}
          description={linkData.description || ''}
          tags={linkData.tags || []}
          createdAt={linkData.createdAt}
        />
      )}
    </div>
  )
}
