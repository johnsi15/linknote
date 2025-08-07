'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag } from '@/types/tag'
import { useInfiniteTags } from '@/hooks/queries/use-tags'
import { useOfflineSync, useConnectivityNotifications, useOnlineStatus } from '@/hooks/use-offline-sync'
import { useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/mutations/use-tag-mutations'
import {
  useCreateOfflineTag,
  useUpdateOfflineTag,
  useDeleteOfflineTag,
} from '@/hooks/mutations/use-offline-tag-mutations'
import { TagInput } from './tag-input'
import { TagList } from './tag-list'
import { TagSearch } from './tag-search'
import { Skeleton } from '@/components/ui/skeleton'

export function TagsManager() {
  const isOnline = useOnlineStatus()

  // ✅ Hook de sincronización para que funcione automáticamente
  useOfflineSync()

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

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteTags(20)

  const tags = data?.pages.flatMap(page => page.tags) || []
  const total = data?.pages[0]?.total ?? 0

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Scroll infinito con IntersectionObserver
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return

    const observer = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fetchNextPage()
      }
    })

    const node = loadMoreRef.current

    if (node) {
      observer.observe(node)
    }

    return () => {
      if (node) observer.unobserve(node)
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleNewTagChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value), [])
  const handleAddTag = useCallback(async () => {
    const tag = newTag.trim()
    if (!tag) {
      setInputError('Tag name is required')
      return
    }

    setInputError(null)

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
  }, [newTag, isOnline, onlineCreateTag, offlineCreateTag])

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

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Add New Tag</CardTitle>
          <CardDescription>Create a new tag to help organize your links.</CardDescription>
        </CardHeader>
        <CardContent>
          <TagInput
            value={newTag}
            onChange={handleNewTagChange}
            onAdd={handleAddTag}
            isLoading={isCreating}
            error={inputError}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Tags</CardTitle>
          <CardDescription>Manage your existing tags.</CardDescription>
          <TagSearch />
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {isLoading ? (
              <div className='space-y-2'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='flex items-center justify-between p-3 border rounded-md'>
                    <div className='flex items-center space-x-2'>
                      <Skeleton className='h-6 w-20 rounded-full' />
                      <Skeleton className='h-4 w-10 rounded' />
                    </div>
                    <div className='flex space-x-1'>
                      <Skeleton className='h-8 w-8 rounded' />
                      <Skeleton className='h-8 w-8 rounded' />
                    </div>
                  </div>
                ))}
              </div>
            ) : !tags || tags.length === 0 ? (
              <p className='text-center text-muted-foreground py-4'>
                You don`t have any tags yet. Create your first tag above.
              </p>
            ) : (
              <>
                <TagList
                  tags={tags}
                  editingTag={editingTag}
                  onStartEditing={handleStartEditing}
                  onEditChange={handleEditTagChange}
                  onSave={handleSaveTag}
                  onCancel={handleCancelEditing}
                  onDelete={handleDeleteTag}
                  onlineDeleteTag={onlineDeleteTag}
                  isOnline={isOnline}
                />
                <div ref={loadMoreRef} />
                {isFetchingNextPage && (
                  <div className='space-y-2 mt-2'>
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className='flex items-center justify-between p-3 border rounded-md'>
                        <div className='flex items-center space-x-2'>
                          <Skeleton className='h-6 w-20 rounded-full' />
                          <Skeleton className='h-4 w-10 rounded' />
                        </div>
                        <div className='flex space-x-1'>
                          <Skeleton className='h-8 w-8 rounded' />
                          <Skeleton className='h-8 w-8 rounded' />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!isFetchingNextPage && hasNextPage && (
                  <button
                    className='w-full py-2 text-sm text-primary hover:underline mt-2'
                    onClick={() => fetchNextPage()}
                  >
                    Load more tags
                  </button>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className='flex justify-between text-sm text-muted-foreground'>
          <p>Total tags: {total}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
