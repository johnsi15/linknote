'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getLinkById, saveLink } from '@/actions/links'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { LinkForm } from '@/components/dashboard/link-form'
import { Link as LinkData, LinkFormData } from '@/types/link'

export default function LinkDetailPage() {
  const params = useParams()
  const router = useRouter()

  const { id } = params as { id: string }
  const isNew = id === 'new'

  const [isLoading, setIsLoading] = useState(true)
  const [linkData, setLinkData] = useState<LinkData | null | undefined>(null)
  const [linkId, setLinkId] = useState<string | undefined>(isNew ? undefined : id)

  useEffect(() => {
    async function fetchLinkData() {
      if (!isNew) {
        setIsLoading(true)
        const result = await getLinkById(id)

        if (result.success) {
          setLinkData(result.link)
        } else {
          toast.error('Error', { description: result.error })
          router.push('/dashboard')
        }
      }

      setIsLoading(false)
    }

    fetchLinkData()
  }, [id, router, isNew])

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

        // Redirigir al dashboard después de guardar (solo si no es autoguardado)
        if (!isAutoSaveEvent) {
          router.push('/dashboard')
        }
      }

      return result
    } else {
      toast.error('Error', { description: result.error || 'No se pudo crear el enlace' })
      return { success: false, error: result.error || 'Error desconocido' }
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='container py-6 max-w-4xl mx-auto'>
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex items-center gap-4'>
          <Link href='/dashboard'>
            <Button variant='outline' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <h1 className='text-2xl font-bold'>{isNew ? 'Add Link' : 'Edit Link'}</h1>
        </div>

        {/* <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setIsEditModalOpen(true)}>
            <PencilIcon className='h-4 w-4 mr-2' />
            Editar
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
            Eliminar
          </Button>
        </div> */}

        <LinkForm
          defaultValues={
            linkData
              ? {
                  title: linkData.title,
                  url: linkData.url,
                  description: linkData.description || '',
                  tags: linkData.tags || [],
                }
              : undefined
          }
          onSubmit={handleSubmit}
          autoSave={!isNew}
        />
      </div>
    </div>
  )
}
