import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { links } from '@/db/schema'
import { linkSchema } from '@/lib/validations/link'
import { getSecureSession } from '@/lib/auth/server'
import { updateLink } from '@/actions/links'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await getSecureSession()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const formData = await request.json()

    const validatedData = linkSchema.parse(formData)
    const result = await updateLink(id, validatedData)

    if (result.success) {
      return NextResponse.json({ success: true, linkId: id })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('Error al actualizar enlace:', error)
    return NextResponse.json({ success: false, error: 'No se pudo actualizar el enlace' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await getSecureSession()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verificar que el enlace pertenece al usuario
    const existingLink = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.userId, userId)),
    })

    if (!existingLink) {
      return NextResponse.json({ success: false, error: 'Enlace no encontrado' }, { status: 404 })
    }

    // Las relaciones linkTags se eliminarán automáticamente por la restricción ON DELETE CASCADE
    await db.delete(links).where(eq(links.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar enlace:', error)
    return NextResponse.json({ success: false, error: 'No se pudo eliminar el enlace' }, { status: 500 })
  }
}
