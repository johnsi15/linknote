import { NextResponse } from 'next/server'
import { getUserLinks, createLink, type LinkFormData } from '@/actions/links'
import { linkSchema } from '@/lib/validations/link'

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

export async function POST(request: Request) {
  try {
    const data: LinkFormData = await request.json()

    const validatedData = linkSchema.parse(data)

    const result = await createLink(validatedData)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Error creating link' }, { status: 400 })
    }

    return NextResponse.json({ success: true, linkId: result.linkId }, { status: 201 })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
