import { NextResponse } from 'next/server'
import { useAuth } from '@clerk/nextjs'
import { db } from '@/db'
import { tags } from '@/db/schema'
import { z } from 'zod'

const requestSchema = z.object({
  url: z.string().url(),
  userId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const { userId } = useAuth()
    const { url } = requestSchema.parse(await request.json())

    // Get existing tags from the user if logged in
    let existingTags: string[] = []

    if (userId) {
      const userTags = await db.query.tags.findMany({
        where: (tags, { eq }) => eq(tags.userId, userId),
        columns: { name: true },
      })

      existingTags = userTags.map(tag => tag.name)
    }

    // Simple regex-based suggestion logic
    const mockAnalyze = (url: string) => {
      let suggestedTags: string[] = []
      let description = ''

      // Extract domain and path parts
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      const path = urlObj.pathname

      // Check for common domains and suggest tags
      if (domain.includes('github.com')) {
        suggestedTags.push('github', 'repository')

        if (path.includes('.md')) {
          suggestedTags.push('documentation')
          description = 'A GitHub repository documentation page with detailed explanations.'
        } else if (path.includes('.js') || path.includes('.ts')) {
          suggestedTags.push('javascript', 'code')
          description = 'A JavaScript code file from a GitHub repository.'
        }
      } else if (domain.includes('stackoverflow.com')) {
        suggestedTags.push('stackoverflow', 'question')
        description = 'A Stack Overflow question with helpful answers from the community.'
      } else if (domain.includes('medium.com')) {
        suggestedTags.push('article', 'blog')
        description = 'An in-depth article on Medium covering programming concepts.'
      } else if (domain.includes('dev.to')) {
        suggestedTags.push('article', 'dev.to')
        description = 'A developer-focused article from the DEV Community.'
      }

      // Suggest some of the user's existing tags if relevant
      if (existingTags.length > 0) {
        for (const tag of existingTags) {
          if (url.toLowerCase().includes(tag) && !suggestedTags.includes(tag)) {
            suggestedTags.push(tag)
          }
        }
      }

      return {
        suggestedTags: [...new Set(suggestedTags)],
        suggestedDescription: description || 'A useful programming resource.',
      }
    }

    const analysis = mockAnalyze(url)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error generating suggestions:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
