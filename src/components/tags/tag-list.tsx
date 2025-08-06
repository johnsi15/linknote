/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo } from 'react'
import { Tag } from '@/types/tag'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from 'lucide-react'

export const TagList = memo(function TagList({
  tags,
  editingTag,
  onStartEditing,
  onEditChange,
  onSave,
  onCancel,
  onDelete,
  onlineDeleteTag,
  isOnline,
}: {
  tags: Tag[]
  editingTag: { id: string; name: string } | null
  onStartEditing: (tag: Tag) => void
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => void
  onCancel: () => void
  onDelete: (id: string) => void
  onlineDeleteTag: any
  isOnline: boolean
}) {
  // Memoizar la lista para evitar renders innecesarios
  const visibleTags = useMemo(() => tags, [tags])

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {visibleTags.map((tag: Tag) => (
        <div key={tag.id} className='flex items-center justify-between p-3 border rounded-md'>
          {editingTag && editingTag.id === tag.id ? (
            <div className='flex-1 flex space-x-2'>
              <Input
                value={editingTag.name}
                onChange={onEditChange}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && onSave()}
              />
              <div className='flex space-x-1'>
                <Button size='icon' variant='ghost' onClick={onSave} className='h-8 w-8 text-green-500'>
                  <CheckIcon className='h-4 w-4' />
                </Button>
                <Button size='icon' variant='ghost' onClick={onCancel} className='h-8 w-8 text-red-500'>
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
                <Button size='icon' variant='ghost' onClick={() => onStartEditing(tag)} className='h-8 w-8'>
                  <PencilIcon className='h-4 w-4' />
                </Button>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => onDelete(tag.id)}
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
  )
})
