import { NextResponse } from 'next/server'
import { getUserLinks } from '@/actions/links'

export async function GET() {
  try {
    const result = await getUserLinks({})

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Error fetching links' }, { status: 500 })
    }

    return NextResponse.json({
      links: result.links ?? [],
      total: result.links?.length ?? 0,
      hasMore: false,
    })
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
