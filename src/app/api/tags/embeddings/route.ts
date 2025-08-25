import { NextRequest } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { findSimilarTags } from '@/lib/upstash-vector'

const findSimilarTagsSchema = z.object({
  tagName: z.string().min(1, 'Tag name is required'),
  limit: z.number().min(1).max(20).optional().default(5),
})

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

    return Response.json({ success: false, error: 'Failed to find similar tags' }, { status: 500 })
  }
}
