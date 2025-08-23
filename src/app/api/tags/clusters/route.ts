import { NextRequest } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { findTagClusters } from '@/lib/upstash-vector'
import { z } from 'zod'

const querySchema = z.object({
  minSize: z.coerce.number().min(2).max(10).optional().default(2),
  maxClusters: z.coerce.number().min(1).max(20).optional().default(6),
})

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return Response.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const { minSize, maxClusters } = querySchema.parse({
      minSize: searchParams.get('minSize'),
      maxClusters: searchParams.get('maxClusters'),
    })

    const clusters = await findTagClusters(user.id, {
      minClusterSize: minSize,
      maxClusters: maxClusters,
      similarityThreshold: 0.7,
    })

    return Response.json({ 
      success: true, 
      clusters,
      total: clusters.length
    })

  } catch (error) {
    console.error('Error al obtener clusters de tags:', error)
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: 'Parámetros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
