import { NextResponse } from 'next/server'
import { updateTag, deleteTag } from '@/actions/tags'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { name } = await request.json()
    const { id } = await params

    if (!name || !id) {
      return NextResponse.json({ error: 'Name and ID are required' }, { status: 400 })
    }

    const result = await updateTag(id, name)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Error updating tag' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const result = await deleteTag(id)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Error deleting tag' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
