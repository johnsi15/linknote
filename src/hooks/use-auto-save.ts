import { useRef, useEffect, useState } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'
import type { LinkFormData } from '@/types/link'

interface UseAutoSaveOptions<T extends FieldValues = LinkFormData> {
  form: UseFormReturn<T>
  onSave: (data: T) => Promise<void>
  delay?: number
  excludeFields?: string[]
  linkId?: string
}

export function useAutoSave<T extends FieldValues = LinkFormData>({
  form,
  onSave,
  delay = 2000,
  excludeFields = [],
  linkId,
}: UseAutoSaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const { watch, formState } = form
  const isSavingRef = useRef(false)
  const lastSavedDataRef = useRef<string>('')

  const debouncedSave = useDebouncedCallback(
    async (data: T) => {
      if (isSavingRef.current) return

      const filteredData = Object.keys(data).reduce((acc, key) => {
        if (!excludeFields.includes(key)) {
          acc[key as keyof T] = data[key as keyof T]
        }

        return acc
      }, {} as T)

      const currentDataString = JSON.stringify(filteredData)

      if (currentDataString === lastSavedDataRef.current) return

      // Valided required fields
      if (!filteredData.title || !filteredData.url) {
        return
      }

      try {
        isSavingRef.current = true
        setSaveStatus('saving')
        lastSavedDataRef.current = currentDataString

        await onSave({ ...filteredData, id: linkId } as T)

        setSaveStatus('saved')
        setLastSaved(new Date())

        // Return to idle after showing "saved"
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        console.error('Error en auto-save:', error)
        setSaveStatus('error')
        lastSavedDataRef.current = ''
        setTimeout(() => setSaveStatus('idle'), 3000)
      } finally {
        isSavingRef.current = false
      }
    },
    delay,
    { leading: false, trailing: true }
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
