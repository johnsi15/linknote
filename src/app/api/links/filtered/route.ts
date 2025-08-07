import { type NextRequest, NextResponse } from 'next/server'
import { getUserLinksFiltered } from '@/actions/links' // Debes crear esta función
import { getSecureSession } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getSecureSession()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams

    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const dateRange = searchParams.get('dateRange') || 'all'
    const sort = searchParams.get('sort') || 'newest'
    const limit = Number(searchParams.get('limit')) || 20
    const offset = Number(searchParams.get('offset')) || 0

    const { links, total } = await getUserLinksFiltered({
      userId,
      search,
      tags,
      dateRange,
      sort,
      limit,
      offset,
    })

    const hasMore = links.length === limit

    return NextResponse.json({
      links,
      total,
      hasMore,
    })
  } catch (error) {
    console.error('Error fetching filtered links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
