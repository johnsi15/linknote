import { NextRequest } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { storeTagEmbedding, findSimilarTags } from '@/lib/upstash-vector'

// Schema de validación
const generateEmbeddingSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  tagName: z.string().min(1, 'Tag name is required'),
})

const findSimilarTagsSchema = z.object({
  tagName: z.string().min(1, 'Tag name is required'),
  limit: z.number().min(1).max(20).optional().default(5),
})

// POST: Generar y almacenar embedding para un tag
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tagId, tagName } = generateEmbeddingSchema.parse(body)

    // Usar la utilidad para almacenar el embedding
    await storeTagEmbedding({ tagId, tagName, userId: user.id })

    return Response.json({ 
      success: true, 
      message: 'Tag embedding generated and stored successfully',
      tagId,
      tagName 
    })

  } catch (error) {
    console.error('Error generating tag embedding:', error)
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return Response.json(
      { success: false, error: 'Failed to generate tag embedding' },
      { status: 500 }
    )
  }
}

// GET: Buscar tags similares
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tagName = searchParams.get('tagName')
    const limit = parseInt(searchParams.get('limit') || '5')

    const { tagName: validatedTagName, limit: validatedLimit } = findSimilarTagsSchema.parse({
      tagName,
      limit,
    })

    // Usar la utilidad para buscar tags similares
    const similarTags = await findSimilarTags(validatedTagName, user.id, validatedLimit)

    return Response.json({
      success: true,
      query: validatedTagName,
      similarTags,
      total: similarTags.length,
    })

  } catch (error) {
    console.error('Error finding similar tags:', error)
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return Response.json(
      { success: false, error: 'Failed to find similar tags' },
      { status: 500 }
    )
  }
}
