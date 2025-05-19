'use client'

import { useState } from 'react'
import { LinkIcon, ExternalLinkIcon, CopyIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { LinkForm } from './link-form'

interface LinkCardProps {
  id?: string
  title: string
  url: string
  description: string
  tags: string[]
  createdAt: string
}

export function LinkCard({ id = 'mock-id', title, url, description, tags, createdAt }: LinkCardProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    // The link has been copied to your clipboard.
    toast('URL copied to clipboard', { description: 'The link has been copied to your clipboard.' })

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const handleUpdate = async (formData: any, isAutoSaveEvent = false) => {
    try {
      // todo...
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
          // Recargar la página para ver los cambios
          window.location.reload()
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

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este enlace?')) {
      setIsDeleting(true)
      // TODO...
      const result = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json())

      if (result.success) {
        toast.success('Enlace eliminado', { description: 'El enlace se ha eliminado correctamente' })
        // router.push('/dashboard')
        window.location.reload()
      } else {
        toast.error('Error', { description: result.error })
        setIsDeleting(false)
      }
    }
  }

  return (
    <>
      <Card className='overflow-hidden'>
        <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
          <div className='space-y-1'>
            <div className='flex items-center'>
              <LinkIcon className='mr-2 h-4 w-4 text-muted-foreground' />
              <h3 className='font-semibold'>{title}</h3>
            </div>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-blue-500 hover:underline break-all'
            >
              {url}
            </a>
          </div>
          <div className='flex space-x-1'>
            <Button variant='ghost' size='icon' onClick={() => copyToClipboard(url)} className='h-8 w-8'>
              <CopyIcon className='h-4 w-4' />
              <span className='sr-only'>Copy URL</span>
            </Button>

            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground'
            >
              <ExternalLinkIcon className='h-4 w-4' />
              <span className='sr-only'>Open link</span>
            </a>
          </div>
        </CardHeader>
        <CardContent className='pb-2'>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </CardContent>
        <CardFooter className='flex items-center justify-between pt-2'>
          <div className='flex flex-wrap gap-1'>
            {tags.map(tag => (
              <Badge key={tag} variant='secondary' className='text-xs'>
                {tag}
              </Badge>
            ))}
          </div>
          <div className='flex items-center space-x-1 text-xs text-muted-foreground'>
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            {id && (
              <div className='flex space-x-1 ml-2'>
                <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setIsEditModalOpen(true)}>
                  <PencilIcon className='h-3.5 w-3.5' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-destructive'
                  onClick={() => handleDelete(id)}
                >
                  <TrashIcon className='h-3.5 w-3.5' />
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Editar Enlace</DialogTitle>
          </DialogHeader>
          <LinkForm
            defaultValues={{
              title,
              url,
              description: description || '',
              tags: tags || [],
            }}
            onSubmit={handleUpdate}
            autoSave={true}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
