import { useState, useTransition, useCallback } from 'react'
import { readStreamableValue } from 'ai/rsc'
import { summarizeUrl } from '@/actions/summarize-url'

export interface SummaryError {
  message: string
  isBlocked: boolean
  statusCode?: number
}

interface ArticleInfo {
  title?: string
  description?: string
  url?: string
  author?: string
  published?: string
  readTime?: number
}

export function useUrlSummary() {
  const [summary, setSummary] = useState('')
  const [articleInfo, setArticleInfo] = useState<ArticleInfo | null>(null)
  const [error, setError] = useState<SummaryError | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSummarize = useCallback(async (url: string) => {
    if (!url) return

    setSummary('')
    setError(null)
    setArticleInfo(null)

    startTransition(async () => {
      try {
        const result = await summarizeUrl(url)

        if (result?.success) {
          setArticleInfo(result.article)

          // Leer el stream
          for await (const delta of readStreamableValue(result.summaryStream)) {
            setSummary(currentSummary => currentSummary + (delta || ''))
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        const isBlocked = errorMessage.includes('403') || errorMessage.toLowerCase().includes('blocked')

        const errorObj: SummaryError = {
          message: errorMessage,
          isBlocked,
          statusCode: errorMessage.includes('403') ? 403 : undefined,
        }

        setError(errorObj)
        console.error('Error summarizing URL:', err)
      }
    })
  }, [])

  return {
    summary,
    articleInfo,
    error,
    isLoading: isPending,
    summarize: handleSummarize,
    reset: () => {
      setSummary('')
      setArticleInfo(null)
      setError(null)
    },
  }
}
