import { extract, type ArticleData } from '@extractus/article-extractor'
import { createStreamableValue } from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export async function summarizeUrl(url: string) {
  if (!url || !isValidUrl(url)) {
    throw new Error('URL inválida')
  }

  try {
    const article = await extract(
      url,
      {
        contentLengthThreshold: 300,
        descriptionTruncateLen: 250,
        wordsPerMinute: 250,
      },
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SummaryBot/1.0)',
        },
        signal: AbortSignal.timeout(15000),
      }
    )

    if (!article || !article.content) {
      throw new Error('Not can to get content from URL')
    }

    const contentForAI = prepareContent(article)

    const stream = createStreamableValue('')

    ;(async () => {
      try {
        const { textStream } = await streamText({
          model: openai('gpt-4o-mini'),
          messages: [
            {
              role: 'system',
              content:
                'Eres un asistente experto en crear resúmenes concisos y útiles de artículos web en español. Mantén un tono profesional pero accesible.',
            },
            {
              role: 'user',
              content: `Resume este artículo en 2-3 párrafos claros y útiles:

              Título: ${article.title || 'Sin título'}
              ${article.description ? `Descripción: ${article.description}` : ''}
              ${article.author ? `Autor: ${article.author}` : ''}
              ${article.published ? `Fecha: ${article.published}` : ''}

              Contenido principal:
              ${contentForAI}
              `,
            },
          ],
          maxTokens: 600,
          temperature: 0.7,
        })

        for await (const delta of textStream) {
          stream.update(delta)
        }

        stream.done()
      } catch (error) {
        stream.error(error.message)
      }
    })()

    return {
      success: true,
      article: {
        title: article.title,
        description: article.description,
        url: article.url,
        author: article.author,
        published: article.published,
        readTime: article.ttr,
      },
      summaryStream: stream.value,
    }
  } catch (error) {
    console.error('Error in summarizeUrl:', error)
    if (error instanceof Error) {
      console.log(error.message)
      throw new Error(`Error al procesar la URL: ${error.message}`)
    } else {
      console.log('Unknown error', error)
    }
  }
}

function isValidUrl(string: string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function prepareContent(article: ArticleData) {
  let content = article.content || ''

  content = content.replace(/<[^>]*>/g, '') // Remove residual HTML
  content = content.replace(/\s+/g, ' ').trim() // Normalize spaces

  // Limited to ~6000 characters to not exceed token limits
  if (content.length > 6000) {
    content = content.substring(0, 6000) + '...'
  }

  return content
}
