import { Index } from '@upstash/vector'
import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'

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

interface TagMetadata {
  tagId: string
  tagName: string
  userId: string
  type: string
  createdAt: string
}

/**
 * Generar y almacenar embedding para un tag
 */
export async function storeTagEmbedding({ tagId, tagName, userId }: TagEmbedding): Promise<void> {
  // Generar embedding usando OpenAI
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-ada-002'),
    value: tagName,
  })

  // Almacenar en Upstash Vector
  await vectorIndex.upsert({
    id: `tag-${tagId}`,
    vector: embedding,
    metadata: {
      tagId,
      tagName,
      userId,
      type: 'tag',
      createdAt: new Date().toISOString(),
    },
  })
}

/**
 * Buscar tags similares para un usuario
 */
export async function findSimilarTags(
  tagName: string, 
  userId: string, 
  limit: number = 5
): Promise<SimilarTag[]> {
  // Generar embedding del tag de consulta
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-ada-002'),
    value: tagName,
  })

  // Buscar tags similares en Upstash Vector
  const results = await vectorIndex.query({
    vector: embedding,
    topK: limit + 1, // +1 porque puede incluir el tag actual
    includeMetadata: true,
    filter: `userId = '${userId}' AND type = 'tag'`,
  })

  // Filtrar y formatear resultados
  return results
    .filter(result => {
      const metadata = result.metadata as unknown as TagMetadata
      return metadata?.tagName?.toLowerCase() !== tagName.toLowerCase()
    })
    .slice(0, limit)
    .map(result => {
      const metadata = result.metadata as unknown as TagMetadata
      return {
        tagId: metadata.tagId,
        tagName: metadata.tagName,
        similarity: result.score || 0,
      }
    })
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
export async function batchProcessTags(tags: Array<{ id: string, name: string, userId: string }>): Promise<void> {
  const batchSize = 10 // Procesar en lotes para evitar rate limits
  
  for (let i = 0; i < tags.length; i += batchSize) {
    const batch = tags.slice(i, i + batchSize)
    
    // Procesar lote en paralelo
    await Promise.all(
      batch.map(tag => 
        storeTagEmbedding({ 
          tagId: tag.id, 
          tagName: tag.name, 
          userId: tag.userId 
        })
      )
    )
    
    // Pequeña pausa entre lotes para respetar rate limits
    if (i + batchSize < tags.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
