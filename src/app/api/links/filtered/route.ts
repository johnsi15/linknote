import { type NextRequest, NextResponse } from 'next/server'
import { getUserLinksFiltered } from '@/actions/links' // Debes crear esta función
import { getSecureSession } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  const { userId } = await getSecureSession()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams

  const search = searchParams.get('search') || ''
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
  const dateRange = searchParams.get('dateRange') || 'all'
  const sort = searchParams.get('sort') || 'newest'

  const links = await getUserLinksFiltered({
    userId,
    search,
    tags,
    dateRange,
    sort,
    limit: 30, // You can implement pagination if needed
  })

  return NextResponse.json({ links })
}
