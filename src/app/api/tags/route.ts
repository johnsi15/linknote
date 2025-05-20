import { NextResponse } from 'next/server'
import { addTag, updateTag, deleteTag } from '@/actions/tags'

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
