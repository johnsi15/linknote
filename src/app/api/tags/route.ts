import { NextResponse, type NextRequest } from 'next/server'
import { addTag, getUserTagsPaginated } from '@/actions/tags'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const search = searchParams.get('search') || ''

    const { tags, total } = await getUserTagsPaginated({ limit, offset, search })

    return NextResponse.json({ tags, total })
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
