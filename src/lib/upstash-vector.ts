import { Index } from '@upstash/vector'

// Configurar el índice de Upstash Vector
const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

export interface TagEmbedding {
  tagId: string
  tagName: string
  userId: string
}

export interface SimilarTag {
  tagId: string
  tagName: string
  similarity: number
}

export interface TagCluster {
  name: string
  tags: Array<{
    tagId: string
    tagName: string
    similarity: number
  }>
  avgSimilarity: number
}

interface TagMetadata {
  tagId: string
  tagName: string
  userId: string
  type: string
  createdAt: string
}

/**
 * Generar y almacenar embedding para un tag usando embeddings integrados de Upstash
 */
export async function storeTagEmbedding({ tagId, tagName, userId }: TagEmbedding): Promise<void> {
  try {
    await vectorIndex.upsert({
      id: `tag-${tagId}`,
      data: tagName, // Upstash genera el embedding automáticamente
      metadata: {
        tagId,
        tagName,
        userId,
        type: 'tag',
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error storing tag embedding:', error)
    throw error
  }
}

/**
 * Encontrar tags similares a un texto dado usando embeddings integrados de Upstash
 */
export async function findSimilarTags(query: string, userId: string, limit = 5): Promise<SimilarTag[]> {
  try {
    // Usar la búsqueda integrada de Upstash
    const results = await vectorIndex.query({
      data: query, // Upstash genera el embedding automáticamente
      topK: limit,
      filter: `userId = '${userId}' AND type = 'tag'`,
      includeMetadata: true,
    })

    // results.forEach((result, index) => {
    //   const metadata = result.metadata as unknown as TagMetadata
    //   console.log(`  Result ${index}:`, {
    //     id: result.id,
    //     score: result.score,
    //     metadata: metadata,
    //     userIdMatch: metadata?.userId === userId ? '✅ MATCH' : '❌ NO MATCH',
    //   })
    // })

    return results.map(result => ({
      tagId: result.metadata?.tagId as string,
      tagName: result.metadata?.tagName as string,
      similarity: result.score,
    }))
  } catch (error) {
    console.error('Error al buscar tags similares:', error)
    return []
  }
}

/**
 * Eliminar embedding de un tag
 */
export async function deleteTagEmbedding(tagId: string): Promise<void> {
  await vectorIndex.delete(`tag-${tagId}`)
}

/**
 * Actualizar embedding de un tag
 */
export async function updateTagEmbedding({ tagId, tagName, userId }: TagEmbedding): Promise<void> {
  // Eliminar el embedding anterior
  await deleteTagEmbedding(tagId)

  // Crear nuevo embedding
  await storeTagEmbedding({ tagId, tagName, userId })
}

/**
 * Procesar tags existentes para generar embeddings (script de migración)
 */
export async function batchProcessTags(tags: Array<{ id: string; name: string; userId: string }>): Promise<void> {
  const batchSize = 10 // Procesar en lotes para evitar rate limits

  for (let i = 0; i < tags.length; i += batchSize) {
    const batch = tags.slice(i, i + batchSize)

    // Procesar lote en paralelo
    await Promise.all(
      batch.map(tag =>
        storeTagEmbedding({
          tagId: tag.id,
          tagName: tag.name,
          userId: tag.userId,
        })
      )
    )

    // Pequeña pausa entre lotes para respetar rate limits
    if (i + batchSize < tags.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

/**
 * Encontrar clusters de tags relacionados semánticamente
 */
export async function findTagClusters(
  userId: string,
  options: {
    minClusterSize?: number
    maxClusters?: number
    similarityThreshold?: number
  } = {}
): Promise<TagCluster[]> {
  const { minClusterSize = 2, maxClusters = 6, similarityThreshold = 0.7 } = options

  try {
    // Obtener todos los tags del usuario desde Upstash Vector
    // Usar vector dummy con las dimensiones correctas (1024 para mixedbread-ai)
    const allTags = await vectorIndex.query({
      vector: new Array(1024).fill(0), // Vector dummy para obtener todos
      topK: 1000,
      includeMetadata: true,
      filter: `userId = '${userId}' AND type = 'tag'`,
    })

    if (allTags.length < minClusterSize) {
      return []
    }

    const clusters: TagCluster[] = []
    const processedTags = new Set<string>()

    // Para cada tag, encontrar sus tags más similares
    for (const tag of allTags) {
      const metadata = tag.metadata as unknown as TagMetadata

      if (processedTags.has(metadata.tagId) || !tag.vector) {
        continue
      }

      // Buscar tags similares a este tag
      const similarTags = await vectorIndex.query({
        vector: tag.vector,
        topK: 10,
        includeMetadata: true,
        filter: `userId = '${userId}' AND type = 'tag'`,
      })

      // Filtrar por umbral de similitud y excluir el tag actual
      const relatedTags = similarTags
        .filter(result => {
          const resultMetadata = result.metadata as unknown as TagMetadata
          return (
            result.score! >= similarityThreshold &&
            resultMetadata.tagId !== metadata.tagId &&
            !processedTags.has(resultMetadata.tagId)
          )
        })
        .map(result => {
          const resultMetadata = result.metadata as unknown as TagMetadata
          return {
            tagId: resultMetadata.tagId,
            tagName: resultMetadata.tagName,
            similarity: result.score!,
          }
        })

      // Si hay suficientes tags relacionados, crear un cluster
      if (relatedTags.length >= minClusterSize - 1) {
        // Agregar el tag principal al cluster
        const clusterTags = [
          {
            tagId: metadata.tagId,
            tagName: metadata.tagName,
            similarity: 1.0,
          },
          ...relatedTags.slice(0, 4), // Máximo 5 tags por cluster
        ]

        const avgSimilarity = clusterTags.reduce((sum, t) => sum + t.similarity, 0) / clusterTags.length

        clusters.push({
          name: generateClusterName(clusterTags.map(t => t.tagName)),
          tags: clusterTags,
          avgSimilarity,
        })

        // Marcar todos los tags del cluster como procesados
        clusterTags.forEach(t => processedTags.add(t.tagId))

        // Limitar el número de clusters
        if (clusters.length >= maxClusters) {
          break
        }
      } else {
        processedTags.add(metadata.tagId)
      }
    }

    // Ordenar clusters por similitud promedio
    return clusters.sort((a, b) => b.avgSimilarity - a.avgSimilarity)
  } catch (error) {
    console.error('Error al encontrar clusters de tags:', error)
    return []
  }
}

/**
 * Generar nombre descriptivo para un cluster basado en los tags
 */
function generateClusterName(tagNames: string[]): string {
  // Buscar palabras comunes o temas
  const commonThemes: Record<string, string> = {
    'javascript|js|react|vue|angular|typescript|ts': '💻 Frontend',
    'design|ui|ux|figma|sketch': '🎨 Diseño',
    'backend|api|server|node|python|java': '⚙️ Backend',
    'mobile|ios|android|flutter|react-native': '📱 Mobile',
    'data|database|sql|mongodb|postgres': '💾 Datos',
    'ai|ml|machine-learning|deep-learning': '🤖 IA/ML',
    'testing|test|qa|cypress|jest': '🧪 Testing',
    'devops|docker|kubernetes|aws|deploy': '🚀 DevOps',
    'marketing|seo|analytics|social': '📈 Marketing',
    'business|startup|entrepreneurship': '💼 Negocios',
  }

  const tagString = tagNames.join(' ').toLowerCase()

  for (const [pattern, name] of Object.entries(commonThemes)) {
    const regex = new RegExp(pattern.split('|').join('|'), 'i')
    if (regex.test(tagString)) {
      return name
    }
  }

  // Si no encuentra tema específico, usar el tag más común o el primero
  return `🏷️ ${tagNames[0].charAt(0).toUpperCase() + tagNames[0].slice(1)}`
}
