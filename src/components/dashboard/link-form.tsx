'use client'

import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { TagInput } from '@/components/dashboard/tag-input'
import { Loader2, Save } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(1, 'The title is required'),
  url: z.string().url('URL invalid'),
  description: z.string().optional(),
  tags: z.array(z.string()),
})

type FormValues = z.infer<typeof formSchema>

interface LinkFormProps {
  defaultValues?: Partial<FormValues>
  onSubmit: (
    values: FormValues,
    isAutoSaveEvent?: boolean
  ) => Promise<{ success: boolean; linkId?: string; error?: string }>
  suggestedTags?: string[]
  autoSave?: boolean
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export function LinkForm({ defaultValues, onSubmit, suggestedTags = [], autoSave = true }: LinkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const initialRender = useRef(true)
  const [linkId, setLinkId] = useState<string | undefined>(undefined)

  const isEditing = Boolean(defaultValues?.title || linkId)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      url: '',
      description: '',
      tags: [],
      ...defaultValues,
    },
  })

  const formValues = form.watch()
  const debouncedFormValues = useDebounce(formValues, 2000)

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    const hasTitleAndUrl =
      debouncedFormValues.title.trim() !== '' &&
      debouncedFormValues.url.trim() !== '' &&
      formSchema.safeParse(debouncedFormValues).success

    if (autoSave && hasTitleAndUrl && !isSubmitting) {
      const autoSaveData = async () => {
        try {
          setAutoSaveStatus('saving')

          const cleanedValues = {
            ...debouncedFormValues,
            title: debouncedFormValues.title.trim(),
            url: debouncedFormValues.url.trim(),
            description: debouncedFormValues.description?.trim() || '',
            tags: debouncedFormValues.tags.map(tag => tag.trim()).filter(tag => tag !== ''),
          }

          const result = await onSubmit(cleanedValues, true)

          if (result.success) {
            if (result.linkId && linkId !== result.linkId) {
              setLinkId(result.linkId)
            }
            setLastSaved(new Date())
            setAutoSaveStatus('saved')
            // Restablece el formulario con los valores guardados para actualizar el estado isDirty
            form.reset(cleanedValues)

            // Cambiar el estado a 'idle' después de 3 segundos
            setTimeout(() => {
              setAutoSaveStatus('idle')
            }, 3000)
          } else {
            setAutoSaveStatus('error')
            console.error('Error al guardar automáticamente:', result.error || 'Unknown error during auto-save')
          }
        } catch (error) {
          console.error('Error al guardar automáticamente:', error)
          setAutoSaveStatus('error')
        }
      }

      if (form.formState.isDirty) {
        autoSaveData()
      }
    }
  }, [debouncedFormValues, autoSave, isSubmitting, isEditing, linkId, onSubmit, form, formSchema])

  const handleSubmit = async (values: FormValues) => {
    const cleanedValues = {
      ...values,
      title: values.title.trim(),
      url: values.url.trim(),
      description: values.description?.trim() || '',
      tags: values.tags.map(tag => tag.trim()).filter(tag => tag !== ''),
    }

    setIsSubmitting(true)
    try {
      const result = await onSubmit(cleanedValues, false)

      if (result.success && result.linkId) {
        setLinkId(result.linkId)
        setLastSaved(new Date())
        form.reset(cleanedValues)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {autoSave && autoSaveStatus !== 'idle' && (
          <div className='text-sm text-muted-foreground flex items-center gap-2 justify-end'>
            {autoSaveStatus === 'saving' && (
              <>
                <Loader2 className='h-3 w-3 animate-spin' />
                <span>Guardando...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <Save className='h-3 w-3' />
                <span>Guardado {lastSaved ? `a las ${lastSaved.toLocaleTimeString()}` : ''}</span>
              </>
            )}
            {autoSaveStatus === 'error' && <span className='text-destructive'>Error al guardar</span>}
          </div>
        )}

        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder='Título del enlace' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder='https://ejemplo.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Descripción del enlace'
                  className='resize-none'
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiquetas</FormLabel>
              <FormControl>
                <TagInput tags={field.value} setTags={field.onChange} suggestedTags={suggestedTags} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Guardar
        </Button>
      </form>
    </Form>
  )
}
