import { useRef, useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'

interface UseAutoSaveOptions<T = any> {
  form: UseFormReturn<any>
  onSave: (data: any) => Promise<T>
  delay?: number
  excludeFields?: string[]
  linkId?: string // Para identificar si es update o create
}

export function useAutoSave<T = any>({
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
    async (data: any) => {
      if (isSavingRef.current) return

      const filteredData = Object.keys(data).reduce((acc, key) => {
        if (!excludeFields.includes(key)) {
          acc[key] = data[key]
        }

        return acc
      }, {} as any)

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

        await onSave({ ...filteredData, id: linkId })

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
        debouncedSave(data)
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
