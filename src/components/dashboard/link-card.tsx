'use client'

import { useState } from 'react'
import { LinkIcon, ExternalLinkIcon, CopyIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'

interface LinkCardProps {
  id?: string
  title: string
  url: string
  description: string
  tags: string[]
  createdAt: string
  onDelete?: (id: string) => void
}

export function LinkCard({ id = 'mock-id', title, url, description, tags, createdAt, onDelete }: LinkCardProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    // The link has been copied to your clipboard.
    toast('URL copied to clipboard', { description: 'The link has been copied to your clipboard.' })

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
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
              <Link href={`/dashboard/edit/${id}`}>
                <Button variant='ghost' size='icon' className='h-7 w-7'>
                  <PencilIcon className='h-3.5 w-3.5' />
                </Button>
              </Link>
              {onDelete && (
                <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive' onClick={() => onDelete(id)}>
                  <TrashIcon className='h-3.5 w-3.5' />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
