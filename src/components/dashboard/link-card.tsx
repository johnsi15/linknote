'use client'

import { useEffect, useState } from 'react'
import { LinkIcon, ExternalLinkIcon, CopyIcon, PencilIcon, TrashIcon, StarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { extractSummary } from '@/lib/utils'
import { useDeleteLink } from '@/hooks/mutations/use-link-mutations'

interface LinkCardProps {
  id?: string
  title: string
  url: string
  description: string
  tags: string[]
  createdAt: string
  isFavorite?: boolean | null
}

import { useToggleFavoriteLink } from '@/hooks/mutations/use-toggle-favorite-link'

export function LinkCard({
  id = 'mock-id',
  title,
  url,
  description,
  tags,
  createdAt,
  isFavorite = false,
}: LinkCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCopied, setIsCopied] = useState(false)
  const router = useRouter()
  const deleteLink = useDeleteLink()

  const [favorite, setFavorite] = useState(!!isFavorite)
  const toggleFavorite = useToggleFavoriteLink()

  const [summary, setSummary] = useState('')

  useEffect(() => {
    setSummary(extractSummary(description))
  }, [description])

  useEffect(() => {
    setFavorite(!!isFavorite)
  }, [isFavorite])

  const handleToggleFavorite = () => {
    if (!id) return

    setFavorite(fav => !fav)

    toggleFavorite.mutate(id, {
      onError: () => setFavorite(fav => !fav),
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    // The link has been copied to your clipboard.
    toast('URL copied to clipboard', { description: 'The link has been copied to your clipboard.' })

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Are you sure you want to remove this link?')) {
      deleteLink.mutate(id, {
        onSuccess: () => {
          toast.success('Link removed', { description: 'The link has been removed successfully' })
        },
        onError: error => {
          toast.error('Error', { description: error.message || 'Error deleting link' })
        },
      })
    }
  }

  return (
    <>
      <Card className='overflow-hidden'>
        <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
          <header className='flex-1 min-w-0 space-y-1'>
            <div className='flex items-center'>
              <LinkIcon className='mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground' />
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
          </header>
          <div className='flex space-x-1'>
            <Button
              variant={favorite ? 'default' : 'ghost'}
              size='icon'
              className={`h-8 w-8 ${favorite ? 'text-yellow-400' : 'text-muted-foreground'}`}
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <StarIcon className={`h-4 w-4 ${favorite ? 'fill-yellow-400' : 'fill-none'}`} />
            </Button>
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
          {summary && <p className='text-sm text-muted-foreground line-clamp-2'>{summary}</p>}
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
                <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => router.push(`/links/${id}`)}>
                  <PencilIcon className='h-3.5 w-3.5' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-destructive'
                  onClick={() => handleDelete(id)}
                  disabled={deleteLink.isPending}
                >
                  <TrashIcon className='h-3.5 w-3.5' />
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
