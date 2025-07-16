import { NextResponse } from 'next/server'
import { addTag, updateTag, deleteTag, getUserTags } from '@/actions/tags'

export async function GET() {
  try {
    const tags = await getUserTags()

    return NextResponse.json({
      tags,
      total: tags.length,
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { name } = await request.json()
  const result = await addTag(name)

  return NextResponse.json(result)
}

export async function PUT(request: Request) {
  const { id, name } = await request.json()
  const result = await updateTag(id, name)

  return NextResponse.json(result)
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const result = await deleteTag(id)

  return NextResponse.json(result)
}
