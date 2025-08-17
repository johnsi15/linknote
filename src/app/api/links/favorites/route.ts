import { NextResponse } from 'next/server'
import { getUserFavoriteLinks } from '@/actions/links'

export async function GET() {
  try {
    const result = await getUserFavoriteLinks()

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      links: result.links,
      total: result.links?.length || 0,
    })
  } catch (error) {
    console.error('Error getting favorite links:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
