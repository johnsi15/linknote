'use client'

import { useState, useEffect, useRef } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tag } from '@/types/tag'
import { useHybridTags } from '@/hooks/queries/use-hybrid-tags'
import { useOfflineSync, useConnectivityNotifications, useOnlineStatus } from '@/hooks/use-offline-sync'
import { useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/mutations/use-tag-mutations'
import {
  useCreateOfflineTag,
  useUpdateOfflineTag,
  useDeleteOfflineTag,
} from '@/hooks/mutations/use-offline-tag-mutations'

export function TagsManager() {
  const { tags, isLoading, source } = useHybridTags()
  const isOnline = useOnlineStatus()
  const { forceSync, getPendingItemsCount } = useOfflineSync()

  // ✅ Ref para evitar múltiples sincronizaciones
  const hasInitialSync = useRef(false)

  // Hooks para modo online
  const onlineCreateTag = useCreateTag()
  const onlineUpdateTag = useUpdateTag()
  const onlineDeleteTag = useDeleteTag()

  // Hooks para modo offline
  const offlineCreateTag = useCreateOfflineTag()
  const offlineUpdateTag = useUpdateOfflineTag()
  const offlineDeleteTag = useDeleteOfflineTag()

  // Hook para notificaciones de conectividad automáticas
  useConnectivityNotifications()

  const [newTag, setNewTag] = useState('')
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)

  // Verificar y sincronizar al cargar el componente - SOLO UNA VEZ
  useEffect(() => {
    const checkAndSync = async () => {
      if (hasInitialSync.current) return // ✅ Evitar múltiples ejecuciones

      try {
        const pendingCount = await getPendingItemsCount()
        if (pendingCount > 0 && navigator.onLine) {
          console.log(`TagsManager: Found ${pendingCount} pending items, starting sync...`)
          hasInitialSync.current = true // ✅ Marcar como ejecutado
          await forceSync()
        }
      } catch (error) {
        console.error('Error checking/syncing pending items:', error)
      }
    }

    checkAndSync()
  }, [forceSync, getPendingItemsCount]) // ✅ Incluir dependencias pero usar ref para evitar loops

  const handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)

  const handleAddTag = async () => {
    const tag = newTag.trim()
    if (!tag) {
      setInputError('Tag name is required')
      return
    }

    setInputError(null)

    console.log('TagsManager: Creating tag:', tag)
    console.log('TagsManager: Online status:', isOnline)

    if (isOnline) {
      // Usar hook online
      onlineCreateTag.mutate(tag, {
        onSuccess: () => {
          setNewTag('')
          toast.success('Tag created')
        },
        onError: (error: Error) => {
          toast.error('Error creating tag', {
            description: error instanceof Error ? error.message : 'An error occurred',
          })
        },
      })
    } else {
      // Usar hook offline directamente
      try {
        const tagId = await offlineCreateTag.createTag({ name: tag })
        if (tagId) {
          setNewTag('')
          toast.success('Tag created offline')
        } else {
          toast.error('Failed to create tag offline')
        }
      } catch (error) {
        console.error('Error creating tag offline:', error)
        toast.error('Error creating tag offline')
      }
    }
  }

  const handleStartEditing = (tag: Tag) => setEditingTag({ id: tag.id, name: tag.name })
  const handleCancelEditing = () => setEditingTag(null)

  const handleEditTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingTag) setEditingTag({ ...editingTag, name: e.target.value })
  }

  const handleSaveTag = async () => {
    if (!editingTag) return
    const tagName = editingTag.name.trim()

    const exists = tags.some(tag => tag.id !== editingTag.id && tag.name.trim().toLowerCase() === tagName.toLowerCase())

    if (exists) {
      toast.error('Tag name already exists', { description: 'Choose a different name.' })
      return
    }

    if (!tagName) {
      toast.error('Tag name cannot be empty', { description: 'The tag name cannot be empty.' })
      return
    }

    if (isOnline) {
      onlineUpdateTag.mutate(
        { id: editingTag.id, name: tagName },
        {
          onSuccess: () => setEditingTag(null),
        }
      )
    } else {
      try {
        const success = await offlineUpdateTag.updateTag({ id: editingTag.id, name: tagName })
        if (success) {
          setEditingTag(null)
          toast.success('Tag updated offline')
        } else {
          toast.error('Failed to update tag offline')
        }
      } catch (error) {
        console.error('Error updating tag offline:', error)
        toast.error('Error updating tag offline')
      }
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    const tagName = tag ? tag.name : 'Unnamed tag'

    const confirmed = window.confirm(
      `Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`
    )

    if (!confirmed) return

    if (isOnline) {
      onlineDeleteTag.mutate(tagId)
    } else {
      try {
        const success = await offlineDeleteTag.deleteTag(tagId)
        if (success) {
          toast.success('Tag deleted offline')
        } else {
          toast.error('Failed to delete tag offline')
        }
      } catch (error) {
        console.error('Error deleting tag offline:', error)
        toast.error('Error deleting tag offline')
      }
    }
  }

  // Determinar estados de carga según el modo
  const isCreating = isOnline ? onlineCreateTag.isPending : offlineCreateTag.isLoading

  useEffect(() => {
    // Solo para mostrar información de conectividad si es necesario
    console.log(`Tags loaded from: ${source} (${tags.length} tags)`)
  }, [source, tags.length])

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Add New Tag</CardTitle>
          <CardDescription>Create a new tag to help organize your links.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex space-x-2'>
            <Input
              placeholder='Enter tag name'
              value={newTag}
              onChange={e => {
                handleNewTagChange(e)
                if (inputError) setInputError(null)
              }}
              onKeyDown={e => e.key === 'Enter' && handleAddTag()}
              disabled={isCreating}
            />
            <Button onClick={handleAddTag} className='gap-2' disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className='animate-spin mr-2 h-4 w-4' /> Creating...
                </>
              ) : (
                <>
                  <PlusIcon className='h-4 w-4' />
                  Add Tag
                </>
              )}
            </Button>
          </div>
          {inputError && <p className='text-xs text-red-500 mt-2'>{inputError}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Tags</CardTitle>
          <CardDescription>Manage your existing tags.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {isLoading ? (
              <p className='text-center text-muted-foreground py-4'>Loading tags...</p>
            ) : !tags || tags.length === 0 ? (
              <p className='text-center text-muted-foreground py-4'>
                You don`t have any tags yet. Create your first tag above.
              </p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {tags.map((tag: Tag) => (
                  <div key={tag.id} className='flex items-center justify-between p-3 border rounded-md'>
                    {editingTag && editingTag.id === tag.id ? (
                      <div className='flex-1 flex space-x-2'>
                        <Input
                          value={editingTag.name}
                          onChange={handleEditTagChange}
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleSaveTag()}
                        />
                        <div className='flex space-x-1'>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={handleSaveTag}
                            className='h-8 w-8 text-green-500'
                          >
                            <CheckIcon className='h-4 w-4' />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={handleCancelEditing}
                            className='h-8 w-8 text-red-500'
                          >
                            <XIcon className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className='flex items-center space-x-2'>
                          <Badge variant='secondary'>{tag.name}</Badge>
                          <span className='text-xs text-muted-foreground'>
                            {tag.count} {tag.count === 1 ? 'link' : 'links'}
                          </span>
                        </div>
                        <div className='flex space-x-1'>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() => handleStartEditing(tag)}
                            className='h-8 w-8'
                          >
                            <PencilIcon className='h-4 w-4' />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() => handleDeleteTag(tag.id)}
                            className='h-8 w-8 text-destructive'
                            disabled={isOnline && onlineDeleteTag.isPending && onlineDeleteTag.variables === tag.id}
                          >
                            <TrashIcon className='h-4 w-4' />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className='flex justify-between text-sm text-muted-foreground'>
          <p>Total tags: {tags.length}</p>
          <p className='text-xs opacity-70'>Source: {source}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
