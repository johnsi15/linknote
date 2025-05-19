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

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'react', count: 12 },
    { id: '2', name: 'typescript', count: 8 },
    { id: '3', name: 'nextjs', count: 7 },
    { id: '4', name: 'css', count: 5 },
    { id: '5', name: 'javascript', count: 15 },
    { id: '6', name: 'tutorial', count: 6 },
    { id: '7', name: 'guide', count: 4 },
    { id: '8', name: 'documentation', count: 9 },
    { id: '9', name: 'api', count: 3 },
    { id: '10', name: 'design', count: 2 },
    { id: '11', name: 'patterns', count: 3 },
    { id: '12', name: 'performance', count: 5 },
  ])

  const [newTag, setNewTag] = useState('')
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null)

  const handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value)
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      const tagExists = tags.some(tag => tag.name.toLowerCase() === newTag.trim().toLowerCase())

      if (tagExists) {
        toast.error('Tag already exists', {
          description: `The tag "${newTag}" already exists.`,
        })
        return
      }

      const newTagObject = {
        id: Date.now().toString(),
        name: newTag.trim().toLowerCase(),
        count: 0,
      }

      setTags([...tags, newTagObject])
      setNewTag('')

      toast('Tag created', {
        description: `The tag "${newTag}" has been created.`,
      })
    }
  }

  const handleStartEditing = (tag: Tag) => {
    setEditingTag({ id: tag.id, name: tag.name })
  }

  const handleCancelEditing = () => {
    setEditingTag(null)
  }

  const handleEditTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingTag) {
      setEditingTag({ ...editingTag, name: e.target.value })
    }
  }

  const handleSaveTag = () => {
    if (editingTag && editingTag.name.trim()) {
      const tagExists = tags.some(
        tag => tag.id !== editingTag.id && tag.name.toLowerCase() === editingTag.name.trim().toLowerCase()
      )

      if (tagExists) {
        toast.error('Tag already exists', {
          description: `The tag "${editingTag.name}" already exists.`,
        })
        return
      }

      setTags(
        tags.map(tag => (tag.id === editingTag.id ? { ...tag, name: editingTag.name.trim().toLowerCase() } : tag))
      )

      setEditingTag(null)

      toast('Tag updated', {
        description: `The tag has been updated to "${editingTag.name}".`,
      })
    }
  }

  const handleDeleteTag = (tagId: string) => {
    const tagToDelete = tags.find(tag => tag.id === tagId)

    if (tagToDelete && tagToDelete.count > 0) {
      toast.error('Cannot delete tag', {
        description: `This tag is used by ${tagToDelete.count} links. Remove the tag from all links first.`,
      })
      return
    }

    setTags(tags.filter(tag => tag.id !== tagId))

    toast('Tag deleted', {
      description: 'The tag has been deleted.',
    })
  }

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight mb-6'>Manage Tags</h1>
      </div>

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
                You don't have any tags yet. Create your first tag above.
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
