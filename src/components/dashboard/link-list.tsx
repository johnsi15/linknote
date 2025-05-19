import { LinkCard } from '@/components/dashboard/link-card'
import { Link } from '@/types/link'

interface LinkListProps {
  links: Link[]
}

export function LinkList({ links }: LinkListProps) {
  if (!links || links.length === 0) {
    return <div className='text-center text-muted-foreground'>No links found</div>
  }

  return (
    <div className='grid grid-cols-1 gap-4'>
      {links.map(({ id, title, url, description, tags, createdAt }) => (
        <LinkCard
          key={id}
          id={id}
          title={title}
          url={url}
          description={description ?? ''}
          tags={tags}
          createdAt={createdAt ? createdAt.toISOString() : ''}
        />
      ))}
    </div>
  )
}
