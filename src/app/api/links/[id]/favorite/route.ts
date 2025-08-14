import { NextRequest, NextResponse } from 'next/server'
import { toggleFavoriteLink } from '@/actions/links'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, error: 'Link ID is required' }, { status: 400 })
    }

    const result = await toggleFavoriteLink(id)

    if (!result.success) {
      const status = result.error === 'Link not found' ? 404 : 500
      return NextResponse.json(result, { status })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in toggle favorite endpoint:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
