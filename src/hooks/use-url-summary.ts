import { useState, useTransition, useCallback } from 'react'
import { readStreamableValue } from 'ai/rsc'
import { summarizeUrl, type ArticleInfo } from '@/actions/summarize-url'

export interface SummaryError {
  message: string
  isBlocked: boolean
  statusCode?: number
}

export function useUrlSummary() {
  const [summary, setSummary] = useState('')
  const [articleInfo, setArticleInfo] = useState<Partial<ArticleInfo> | null>(null)
  const [error, setError] = useState<SummaryError | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSummarize = useCallback(async (url: string) => {
    if (!url) return

    setSummary('')
    setError(null)
    setArticleInfo(null)

    try {
      startTransition(async () => {
        try {
          const result = await summarizeUrl(url)

          if (!result.success) {
            // Manejar error del servidor
            setError({
              message: result.error?.message || 'Error desconocido al procesar la URL',
              isBlocked: result.error?.isBlocked || false,
              statusCode: result.error?.statusCode,
            })
            return
          }

          // Si llegamos aquí, la operación fue exitosa
          if (result.article) {
            setArticleInfo(result.article)
          }

          // Leer el stream si está disponible
          if (result.summaryStream) {
            try {
              for await (const delta of readStreamableValue(result.summaryStream)) {
                setSummary(currentSummary => currentSummary + (delta || ''))
              }
            } catch (err) {
              console.error('Error al leer el stream:', err)
              setError({
                message: 'Error al procesar el contenido de la URL',
                isBlocked: false,
              })
            }
          }
        } catch (err) {
          console.error('Error al resumir la URL:', err)
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido al procesar la URL'
          setError({
            message: errorMessage,
            isBlocked:
              errorMessage.toLowerCase().includes('bloqueado') || errorMessage.toLowerCase().includes('forbidden'),
          })
        }
      })
    } catch (err) {
      console.error('Error inesperado en handleSummarize:', err)
      setError({
        message: 'Error inesperado al procesar la solicitud',
        isBlocked: false,
      })
    }
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
