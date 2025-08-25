import { useQuery } from '@tanstack/react-query'
import type { TagCluster } from '@/lib/upstash-vector'

interface UseTagClustersOptions {
  minSize?: number
  maxClusters?: number
  enabled?: boolean
}

interface TagClustersResponse {
  success: boolean
  clusters: TagCluster[]
  total: number
  error?: string
}

export function useTagClusters(options: UseTagClustersOptions = {}) {
  const { minSize = 2, maxClusters = 6, enabled = true } = options

  return useQuery({
    queryKey: ['tag-clusters', { minSize, maxClusters }],
    queryFn: async (): Promise<TagCluster[]> => {
      const params = new URLSearchParams({
        minSize: minSize.toString(),
        maxClusters: maxClusters.toString(),
      })

      const response = await fetch(`/api/tags/clusters?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener clusters de tags')
      }

      const data: TagClustersResponse = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error al obtener clusters de tags')
      }

      return data.clusters
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Keys para invalidar cache cuando sea necesario
export const tagClustersKeys = {
  all: ['tag-clusters'] as const,
  clusters: (params: Pick<UseTagClustersOptions, 'minSize' | 'maxClusters'>) => 
    ['tag-clusters', params] as const,
}
