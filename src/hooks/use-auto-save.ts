import { useRef, useEffect, useState, useCallback } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'
import type { LinkFormData } from '@/types/link'

interface UseAutoSaveOptions<T extends FieldValues = LinkFormData> {
  form: UseFormReturn<T>
  onSave: (data: T) => Promise<void>
  delay?: number
  linkId?: string
  disabled?: boolean
}

type WithTags = {
  tags?: string[]
}

export function useAutoSave<T extends FieldValues = LinkFormData>({
  form,
  onSave,
  delay = 1000,
  linkId,
  disabled,
}: UseAutoSaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const { watch, formState } = form
  const isSavingRef = useRef(false)
  const lastSavedDataRef = useRef<string>('')
  const lastTagsRef = useRef<string[]>([])

  const haveTagsChanged = useCallback((newTags: string[], oldTags: string[]) => {
    if (newTags.length !== oldTags.length) return true
    return newTags.some((tag, i) => tag.trim() !== oldTags[i]?.trim())
  }, [])

  const normalizeData = useCallback((data: T) => {
    const normalized = { ...data } as WithTags
    if (Array.isArray(normalized.tags)) {
      normalized.tags = normalized.tags.map(t => (typeof t === 'string' ? t.trim() : '')).filter(Boolean) as string[]
    }
    return normalized as T
  }, [])

  const debouncedSave = useDebouncedCallback(
    async (data: T) => {
      if (disabled) return
      if (isSavingRef.current) return

      const normalizedData = normalizeData(data)
      const currentDataString = JSON.stringify(normalizedData)

      if (currentDataString === lastSavedDataRef.current) return

      if (!normalizedData.title || !normalizedData.url) return

      if (
        Array.isArray(normalizedData.tags) &&
        !haveTagsChanged(normalizedData.tags, lastTagsRef.current) &&
        currentDataString === lastSavedDataRef.current
      ) {
        return
      }

      try {
        isSavingRef.current = true
        setSaveStatus('saving')
        await onSave({ ...normalizedData, id: linkId } as T)

        lastSavedDataRef.current = currentDataString
        if (Array.isArray(normalizedData.tags)) {
          lastTagsRef.current = [...normalizedData.tags]
        }

        setSaveStatus('saved')
        setLastSaved(new Date())
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        console.error('Error en auto-save:', error)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } finally {
        isSavingRef.current = false
      }
    },
    delay,
    { leading: false, trailing: true, maxWait: 5000 }
  )

  useEffect(() => {
    const subscription = watch(data => {
      if (formState.isValid && !formState.isSubmitting) {
        debouncedSave(data as T)
      }
    })

    return () => {
      subscription.unsubscribe()
      debouncedSave.cancel()
    }
  }, [watch, debouncedSave, formState.isValid, formState.isSubmitting])

  return {
    saveStatus,
    lastSaved,
    cancelAutoSave: debouncedSave.cancel,
  }
}
