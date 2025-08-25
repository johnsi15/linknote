'use client'

import { useRouter } from 'next/navigation'
import { TagClusters } from './tag-clusters'

interface TagClustersWrapperProps {
  className?: string
}

export function TagClustersWrapper({ className }: TagClustersWrapperProps) {
  const router = useRouter()

  const handleTagClick = (tagName: string) => {
    // Navegar a la página de links filtrada por el tag
    router.push(`/links?tags=${encodeURIComponent(tagName)}`)
  }

  return (
    <TagClusters 
      className={className}
      onTagClick={handleTagClick}
    />
  )
}
