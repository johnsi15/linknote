'use client'

import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { TagInput } from '@/components/dashboard/tag-input'
import { Info, Loader2, Save, SparklesIcon } from 'lucide-react'

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

export function LinkForm({ defaultValues, onSubmit, autoSave = true }: LinkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const initialRender = useRef(true)
  const [linkId, setLinkId] = useState<string | undefined>(undefined)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [noSuggestions, setNoSuggestions] = useState(false)
  const router = useRouter()

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
            router.refresh()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchSuggestedTags = async (url: string, title: string, description: string, tags: string[]) => {
    if (!url) return
    setIsLoadingSuggestions(true)

    try {
      const res = await fetch('/api/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title, description, tags }),
      })

      const data = await res.json()
      setSuggestedTags(data.tags || [])
      if (data.tags.length === 0) {
        setNoSuggestions(true)
      } else {
        setNoSuggestions(false)
      }
    } catch (e) {
      console.error('Error fetching suggested tags:', e)
      setSuggestedTags([])
    } finally {
      setIsLoadingSuggestions(false)
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='Link title' {...field} />
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
                <Input placeholder='https://johnserrano.co' {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='Link description' className='resize-none' {...field} value={field.value || ''} />
              </FormControl>
              <span className='text-xs text-muted-foreground flex items-center gap-1 mt-1'>
                <Info className='w-3 h-3' />
                Soon you will be able to write rich content here...
              </span>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className='flex items-start gap-2'>
                <FormControl>
                  <TagInput tags={field.value} setTags={field.onChange} />
                </FormControl>
                <Button
                  type='button'
                  size='icon'
                  variant='outline'
                  onClick={() =>
                    fetchSuggestedTags(
                      form.getValues('url'),
                      form.getValues('title'),
                      form.getValues('description') ?? '',
                      form.getValues('tags') ?? []
                    )
                  }
                  disabled={isLoadingSuggestions || !form.getValues('url')}
                  className='ml-2 self-start mt-1'
                  title='Suggest AI tags'
                >
                  <SparklesIcon className='h-5 w-5' />
                </Button>
              </div>
              {isLoadingSuggestions && <span className='text-xs text-muted-foreground'>Generating suggestions...</span>}
              {suggestedTags.length > 0 && (
                <div className='flex flex-wrap gap-2 mt-2'>
                  {suggestedTags
                    .filter(tag => !field.value.map((t: string) => t.toLowerCase()).includes(tag.toLowerCase()))
                    .map(tag => (
                      <Button
                        key={tag}
                        type='button'
                        size='sm'
                        variant='secondary'
                        onClick={() => field.onChange([...new Set([...(field.value || []), tag])])}
                      >
                        {tag}
                      </Button>
                    ))}
                </div>
              )}
              {!isLoadingSuggestions && noSuggestions && suggestedTags.length === 0 && (
                <span className='text-xs text-muted-foreground'>No suggestions available</span>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isSubmitting || autoSaveStatus === 'saving'}>
          {(isSubmitting || autoSaveStatus === 'saving') && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}

          {isSubmitting || autoSaveStatus === 'saving' ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </form>
    </Form>
  )
}
