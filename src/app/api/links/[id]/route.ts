import { NextRequest, NextResponse } from 'next/server'
import { linkSchema } from '@/lib/validations/link'
import { getSecureSession } from '@/lib/auth/server'
import { deleteLink, updateLink } from '@/actions/links'

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
    const result = await deleteLink(id)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('Error al eliminar enlace:', error)
    return NextResponse.json({ success: false, error: 'No se pudo eliminar el enlace' }, { status: 500 })
  }
}
