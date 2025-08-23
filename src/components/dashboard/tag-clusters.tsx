'use client'

import { useState } from 'react'
import { Tag, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTagClusters } from '@/hooks/queries/use-tag-clusters'
import { cn } from '@/lib/utils'

interface TagClustersProps {
  className?: string
  onTagClick?: (tagName: string) => void
}

export function TagClusters({ className, onTagClick }: TagClustersProps) {
  const [expandedClusters, setExpandedClusters] = useState<Set<number>>(new Set([0]))
  
  const { data: clusters, isLoading, error } = useTagClusters({
    maxClusters: 6,
    minSize: 2
  })

  const toggleCluster = (index: number) => {
    const newExpanded = new Set(expandedClusters)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedClusters(newExpanded)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tags Relacionados
          </CardTitle>
          <CardDescription>
            Descubre conexiones entre tus tags
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-18" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !clusters?.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tags Relacionados
          </CardTitle>
          <CardDescription>
            {error ? 'Error al cargar clusters' : 'Agrega más tags para ver conexiones semánticas'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Tags Relacionados
        </CardTitle>
        <CardDescription>
          Descubre conexiones entre tus tags ({clusters.length} grupos encontrados)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {clusters.map((cluster, index) => (
          <div key={index} className="border rounded-lg p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCluster(index)}
              className="w-full justify-between p-0 h-auto"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{cluster.name}</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(cluster.avgSimilarity * 100)}%
                </Badge>
              </div>
              {expandedClusters.has(index) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>

            {expandedClusters.has(index) && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {cluster.tags.map((tag) => (
                    <Badge
                      key={tag.tagId}
                      variant="secondary"
                      className={cn(
                        "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                        tag.similarity === 1.0 && "border-primary"
                      )}
                      onClick={() => onTagClick?.(tag.tagName)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.tagName}
                      {tag.similarity !== 1.0 && (
                        <span className="ml-1 text-xs opacity-70">
                          {Math.round(tag.similarity * 100)}%
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {cluster.tags.length} tags relacionados semánticamente
                </p>
              </div>
            )}
          </div>
        ))}
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Los clusters se actualizan automáticamente según tus tags
        </div>
      </CardContent>
    </Card>
  )
}
