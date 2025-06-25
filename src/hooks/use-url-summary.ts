import { useState, useTransition } from 'react'
import { readStreamableValue } from 'ai/rsc'
import { summarizeUrl } from '@/actions/summarize-url'

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
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSummarize = async (url: string) => {
    if (!url) return

    setSummary('')
    setError('')
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
        setError(err instanceof Error ? err.message : String(err))
        console.error('Error summarizing URL:', err)
      }
    })
  }

  return {
    summary,
    articleInfo,
    error,
    isLoading: isPending,
    summarize: handleSummarize,
    reset: () => {
      setSummary('')
      setArticleInfo(null)
      setError('')
    },
  }
}
