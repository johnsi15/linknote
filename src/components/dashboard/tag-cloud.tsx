import React from 'react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
// import { useTagFilter } from '@/hooks/use-tag-filter'

interface Tag {
  name: string
  count: number
}

interface TagCloudProps {
  tags: Tag[]
}

export function TagCloud({ tags }: TagCloudProps) {
  // const [activeTag, setActiveTag] = useTagFilter()
  const maxCount = Math.max(...tags.map(tag => tag.count))

  // Calculate font size based on count (between 0.7rem and 1.2rem)
  const getFontSize = (count: number) => {
    const minSize = 0.7
    const maxSize = 1.3
    return minSize + (count / maxCount) * (maxSize - minSize) + 'rem'
  }

  // Get color variant based on count
  const getVariant = (count: number) => {
    const ratio = count / maxCount

    if (ratio > 0.8) return 'default'
    if (ratio > 0.6) return 'secondary'
    return 'outline'
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {tags.map(tag => (
        <Link href={`/dashboard/links?tag=${tag.name}`} key={tag.name}>
          <Badge
            variant={getVariant(tag.count) as any}
            style={{ fontSize: getFontSize(tag.count) }}
            className='cursor-pointer transition-all hover:scale-105'
          >
            {tag.name} <span className='ml-1 text-xs opacity-70'>{tag.count}</span>
          </Badge>
        </Link>
      ))}
    </div>
  )
}
