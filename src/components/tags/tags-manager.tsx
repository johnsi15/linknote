'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tag } from '@/types/tag'
import { useTags } from '@/hooks/queries/use-tags'
import { useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/mutations/use-tag-mutations'
import { useOfflineLinknote } from '@/hooks/use-offline-linknote'

export function TagsManager() {
  const { data, isLoading } = useTags()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const offline = useOfflineLinknote()
  const [newTag, setNewTag] = useState('')
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)

  const handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)

  const handleAddTag = async () => {
    const tag = newTag.trim()
    if (!tag) {
      setInputError('Tag name is required')
      return
    }

    setInputError(null)

    if (!offline.isOnline) {
      try {
        await offline.tag.create({ name: tag })
        setNewTag('')
        toast('Tag created (offline)', { description: `The tag "${tag}" has been created offline.` })
      } catch (error) {
        console.log(error)
        toast.error('Error creating tag', { description: 'Could not create tag offline.' })
      }

      return
    }

    createTag.mutate(tag, {
      onSuccess: () => {
        setNewTag('')
        toast('Tag created', { description: `The tag "${tag}" has been created.` })
      },
      onError: (error: unknown) => {
        if (error instanceof Error) {
          toast.error('Error creating tag', {
            description: error.message || 'An error occurred while creating the tag.',
          })
        } else {
          toast.error('Error creating tag', { description: 'An unknown error occurred while creating the tag.' })
        }
      },
    })
  }

  const handleStartEditing = (tag: Tag) => setEditingTag({ id: tag.id, name: tag.name })
  const handleCancelEditing = () => setEditingTag(null)

  const handleEditTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingTag) setEditingTag({ ...editingTag, name: e.target.value })
  }

  const handleSaveTag = async () => {
    if (!editingTag) return
    const tagName = editingTag.name.trim()
    const exists = data?.tags.some(
      tag => tag.id !== editingTag.id && tag.name.trim().toLowerCase() === tagName.toLowerCase()
    )

    if (exists) {
      toast.error('Tag name already exists', { description: 'Choose a different name.' })
      return
    }

    if (!tagName) {
      toast.error('Tag name cannot be empty', { description: 'The tag name cannot be empty.' })
      return
    }

    if (!offline.isOnline) {
      try {
        await offline.tag.update({ id: editingTag.id, name: tagName })
        setEditingTag(null)
        toast('Tag updated (offline)', { description: `The tag has been updated to "${tagName}" (offline).` })
      } catch (error) {
        console.log(error)
        toast.error('Error saving tag', { description: 'Could not update tag offline.' })
      }

      return
    }

    updateTag.mutate(
      { id: editingTag.id, name: tagName },
      {
        onSuccess: () => {
          setEditingTag(null)
          toast('Tag updated', { description: `The tag has been updated to "${tagName}".` })
        },
        onError: (error: unknown) => {
          if (error instanceof Error) {
            toast.error('Error saving tag', { description: error.message || 'An error occurred while saving the tag.' })
          } else {
            toast.error('Error saving tag', { description: 'An unknown error occurred while saving the tag.' })
          }
        },
      }
    )
  }

  const handleDeleteTag = async (tagId: string) => {
    const tag = data?.tags.find(t => t.id === tagId)
    const tagName = tag ? tag.name : ''
    const confirmed = window.confirm(
      `Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`
    )

    if (!confirmed) return

    if (!offline.isOnline) {
      try {
        await offline.tag.delete(tagId)
        toast('Tag deleted (offline)', { description: 'The tag has been deleted offline.' })
      } catch (error) {
        console.log(error)
        toast.error('Error deleting tag', { description: 'Could not delete tag offline.' })
      }

      return
    }

    deleteTag.mutate(tagId, {
      onSuccess: () => {
        toast('Tag deleted', { description: 'The tag has been deleted.' })
      },
      onError: (error: unknown) => {
        if (error instanceof Error) {
          toast.error('Error deleting tag', {
            description: error.message || 'An error occurred while deleting the tag.',
          })
        } else {
          toast.error('Error deleting tag', { description: 'An unknown error occurred while deleting the tag.' })
        }
      },
    })
  }

  const onlineTags = (data?.tags ?? []).filter(tag => tag.id && tag.name)
  const offlineTags = (offline.tags ?? []).filter(tag => tag.id && tag.name)
  const tagsMap = new Map<string, Tag>()

  offlineTags.forEach(tag => tagsMap.set(tag.id, tag))
  onlineTags.forEach(tag => tagsMap.set(tag.id, tag))

  const displayTags = Array.from(tagsMap.values())

  // Sincronización automática de tags offline
  useEffect(() => {
    if (offline.isOnline && offline.syncStatus.pendingItems > 0) {
      offline.sync.syncAll()
    }
  }, [offline.isOnline, offline.syncStatus.pendingItems, offline.sync])

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
              disabled={createTag.isPending}
            />
            <Button onClick={handleAddTag} className='gap-2' disabled={createTag.isPending}>
              {createTag.isPending ? (
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
            ) : !data?.tags || data.tags.length === 0 ? (
              <p className='text-center text-muted-foreground py-4'>
                You don`t have any tags yet. Create your first tag above.
              </p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {displayTags.map(tag => (
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
                            disabled={deleteTag.isPending && deleteTag.variables === tag.id}
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
          <p>Total tags: {data?.tags?.length ?? 0}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
