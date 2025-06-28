'use server'

import { extract, type ArticleData } from '@extractus/article-extractor'
import { createStreamableValue, type StreamableValue } from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export type ArticleInfo = {
  title?: string
  description?: string
  url?: string
  author?: string
  published?: string
  readTime?: number
}

interface ExtendedError extends Error {
  response?: {
    status?: number
    [key: string]: unknown
  }
  code?: string
  status?: number
  isExtractionError?: boolean
}

type ErrorResponse = {
  message: string
  isBlocked: boolean
  statusCode?: number
}

export type SummarizeUrlResponse = {
  success: boolean
  article?: ArticleInfo
  summaryStream?: StreamableValue<string>
  error?: ErrorResponse
}

export async function summarizeUrl(url: string): Promise<SummarizeUrlResponse> {
  'use server'

  if (!url || !isValidUrl(url)) {
    throw new Error('URL inválida')
  }

  // Lista de User-Agents rotativos
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  ]

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

  try {
    const article = await extractWithFallbacks(url, randomUserAgent)

    if (!article || !article.content) {
      throw new Error('No se pudo obtener contenido de la URL')
    }

    const contentForAI = prepareContent(article)

    const stream = createStreamableValue('')

    ;(async () => {
      try {
        const { textStream } = streamText({
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
        stream.error(error instanceof Error ? error.message : 'Error desconocido')
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

    const extendedError = error as ExtendedError
    const errorMessage = getSpecificErrorMessage(url, extendedError)

    const isBlocked =
      extendedError.response?.status === 403 ||
      extendedError.code === 'ECONNREFUSED' ||
      errorMessage.toLowerCase().includes('bloqueado') ||
      errorMessage.toLowerCase().includes('forbidden')

    const errorResponse: ErrorResponse = {
      message: errorMessage,
      isBlocked,
      statusCode: extendedError.response?.status || extendedError.status,
    }

    return {
      success: false,
      error: errorResponse,
    }
  }
}

async function extractWithFallbacks(url: string, userAgent: string) {
  const baseHeaders = {
    'User-Agent': userAgent,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate, br',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  }

  try {
    const delay = Math.random() * 2000 + 1000 // 1-3 segundos
    await new Promise(resolve => setTimeout(resolve, delay))

    const article = await extract(
      url,
      {
        contentLengthThreshold: 200,
        descriptionTruncateLen: 300,
        wordsPerMinute: 250,
      },
      {
        headers: baseHeaders,
        signal: AbortSignal.timeout(20000),
      }
    )

    if (article?.content) return article
  } catch (error) {
    console.log('Estrategia 1 falló:', error instanceof Error ? error.message : 'Error desconocido')
  }

  try {
    const enhancedHeaders = {
      ...baseHeaders,
      Referer: 'https://www.google.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Cache-Control': 'max-age=0',
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    const article = await extract(
      url,
      {
        contentLengthThreshold: 150,
        descriptionTruncateLen: 300,
        wordsPerMinute: 250,
      },
      {
        headers: enhancedHeaders,
        signal: AbortSignal.timeout(25000),
      }
    )

    if (article?.content) return article
  } catch (error) {
    console.log('Estrategia 2 falló:', error instanceof Error ? error.message : 'Error desconocido')
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 3000))

    const response = await fetch(url, {
      headers: {
        ...baseHeaders,
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
      },
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const article = await extract(html, {
      contentLengthThreshold: 100,
      descriptionTruncateLen: 300,
      wordsPerMinute: 250,
    })

    if (article?.content) {
      article.url = url
      return article
    }
  } catch (error) {
    console.log('Estrategia 3 falló:', error instanceof Error ? error.message : 'Error desconocido')
  }

  const errorMessages = [
    'No se pudo extraer el contenido del artículo.',
    'Posibles causas:',
    '- El sitio web podría estar bloqueando solicitudes automatizadas',
    '- El contenido podría estar detrás de un paywall o requerir autenticación',
    '- La estructura de la página podría no ser compatible con nuestras herramientas de extracción',
    '\nSugerencia: Intenta copiar el contenido manualmente o verifica que la URL sea accesible desde un navegador.',
  ]

  const error = new Error(errorMessages.join('\n')) as ExtendedError
  error.isExtractionError = true
  throw error
}

function getSpecificErrorMessage(url: string, error: Error): string {
  // Si es un error de extracción, devolver el mensaje original
  const extendedError = error as ExtendedError
  if (extendedError.isExtractionError) {
    return error.message
  }

  const domain = new URL(url).hostname.toLowerCase()

  const problematicSites = {
    'twitter.com': 'Twitter requiere autenticación. Intenta con un tweet público específico.',
    'x.com': 'X (Twitter) requiere autenticación. Intenta con un post público específico.',
    'linkedin.com': 'LinkedIn bloquea bots. Considera copiar el contenido manualmente.',
    'facebook.com': 'Facebook no permite extracción automatizada.',
    'instagram.com': 'Instagram bloquea este tipo de requests.',
    'medium.com': 'Medium a veces bloquea bots. Intenta con el enlace directo al artículo.',
    'nytimes.com': 'NYTimes tiene paywall y protecciones anti-bot.',
    'wsj.com': 'Wall Street Journal bloquea bots.',
  }

  for (const [site, message] of Object.entries(problematicSites)) {
    if (domain.includes(site)) {
      return `Error específico de ${site}: ${message}`
    }
  }

  if (error.message?.includes('403')) {
    return 'El sitio web está bloqueando requests automatizados. Algunos sitios tienen protecciones anti-bot muy estrictas.'
  }

  if (error.message?.includes('timeout')) {
    return 'El sitio web tardó demasiado en responder. Puede estar sobrecargado o tener protecciones lentas.'
  }

  if (error.message?.includes('404')) {
    return 'La página no existe o ha sido movida.'
  }

  return `Error al procesar la URL: ${error.message}. Algunos sitios web tienen protecciones que impiden la extracción automática de contenido.`
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
