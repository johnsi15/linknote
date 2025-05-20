'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

interface Tag {
  id: string
  name: string
  count: number
}

export function TagsManager({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [newTag, setNewTag] = useState('')
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null)

  const handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)

  const handleAddTag = async () => {
    try {
      const tag = newTag.trim()

      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: tag }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Error creating tag', { description: data.error || 'An error occurred while creating the tag.' })
        return
      }

      const newTagObject: Tag = { id: data.tag.id, name: tag, count: 0 }

      setTags([...tags, newTagObject])
      setNewTag('')
      toast('Tag created', { description: `The tag "${newTag}" has been created.` })
    } catch (error) {
      console.error('Error creating tag:', error)
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

    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingTag?.id, name: tagName }),
      })

      const { error } = await response.json()

      if (!response.ok) {
        toast.error('Error saving tag', { description: error || 'An error occurred while saving the tag.' })
        return
      }

      setTags(tags.map(tag => (tag.id === editingTag.id ? { ...tag, name: editingTag.name.trim() } : tag)))

      setEditingTag(null)
      toast('Tag updated', { description: `The tag has been updated to "${editingTag.name}".` })
    } catch (error) {
      console.error('Error saving tag:', error)
      toast.error('Error saving tag', { description: 'An error occurred while saving the tag.' })
      return
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    const tagName = tag ? tag.name : ''

    const confirmed = window.confirm(
      `Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      const response = await fetch('/api/tags', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: tagId }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error('Error deleting tag', { description: data.error || 'An error occurred while deleting the tag.' })
        return
      }

      const { error } = await response.json()

      if (error) {
        toast.error('Cannot delete tag', { description: error })
        return
      }

      setTags(tags.filter(tag => tag.id !== tagId))
      toast('Tag deleted', { description: 'The tag has been deleted.' })
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error('Error deleting tag', { description: 'An error occurred while deleting the tag.' })
      return
    }
  }

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
              onChange={handleNewTagChange}
              onKeyDown={e => e.key === 'Enter' && handleAddTag()}
            />
            <Button onClick={handleAddTag} className='gap-2'>
              <PlusIcon className='h-4 w-4' />
              Add Tag
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Tags</CardTitle>
          <CardDescription>Manage your existing tags.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {tags.length === 0 ? (
              <p className='text-center text-muted-foreground py-4'>
                You don`t have any tags yet. Create your first tag above.
              </p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {tags.map(tag => (
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
        </CardFooter>
      </Card>
    </div>
  )
}
