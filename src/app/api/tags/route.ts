import { NextResponse } from 'next/server'
import { addTag, getUserTags } from '@/actions/tags'

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
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const result = await addTag(name)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Error creating tag' }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
