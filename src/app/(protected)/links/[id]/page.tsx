'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useState } from 'react'
import { LinkForm } from '@/components/dashboard/link-form'
import { LinkFormData } from '@/types/link'
import { useSaveLink } from '@/hooks/mutations/use-link-mutations'
import { useLink } from '@/hooks/queries/use-links'

export default function LinkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const saveLinkMutation = useSaveLink()

  const { id } = params as { id: string }
  const isNew = id === 'new'

  const [linkId, setLinkId] = useState<string | undefined>(isNew ? undefined : id)
  const [hasBeenSaved, setHasBeenSaved] = useState(false)

  // Usar el hook para obtener el link
  const { data: linkData, isLoading, error } = useLink(id)

  const handleSubmit = async (formData: LinkFormData, isAutoSaveEvent = false) => {
    if (!isAutoSaveEvent && linkId) {
      return { success: true, linkId }
    }

    const safeFormData = {
      ...formData,
      description: formData.description ?? '',
    }

    const isActualUpdateForBackend = Boolean(linkId) && hasBeenSaved

    return new Promise<{ success: boolean; linkId?: string; error?: string }>(resolve => {
      saveLinkMutation.mutate(
        {
          data: safeFormData,
          isUpdate: isActualUpdateForBackend,
          linkId,
        },
        {
          onSuccess: result => {
            if (result.success) {
              if (result.linkId) {
                setLinkId(result.linkId)
                setHasBeenSaved(true)
                if (isNew) {
                  toast.success('Link created', {
                    description: 'The link has been saved successfully',
                  })
                  resolve(result)
                  router.replace(`/links/${result.linkId}`)
                  return
                }
              }

              if (isAutoSaveEvent) {
                toast.success('Link saved', { duration: 2000 })
                router.refresh()
              } else {
                toast.success(isActualUpdateForBackend ? 'Link updated' : 'Link created', {
                  description: 'The link has been saved successfully',
                })

                if (!isAutoSaveEvent) {
                  router.push('/dashboard')
                }
              }
              resolve(result)
            } else {
              toast.error('Error', { description: result.error || 'Error saving link' })
              resolve({ success: false, error: result.error || 'Error saving link' })
            }
          },
          onError: error => {
            console.log('Error saving link:', error)
            toast.error('Error', { description: 'An error occurred while saving the link' })
            resolve({ success: false, error: 'An error occurred while saving the link' })
          },
        }
      )
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (error) {
    toast.error('Error', { description: 'Error loading link' })
    router.push('/dashboard')
    return null
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
