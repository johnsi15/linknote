'use client'

import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { TagInput } from '@/components/dashboard/tag-input'
import { Loader2, SparklesIcon } from 'lucide-react'
import { RichTextEditor } from '@/components/dashboard/rich-text-editor'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useUrlSummary } from '@/hooks/use-url-summary'
import { cleanHtmlContent, isDescriptionEmpty } from '@/lib/utils'
import { useDebounce } from 'use-debounce'

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

export function LinkForm({ defaultValues, onSubmit }: LinkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [linkId, setLinkId] = useState<string | undefined>(undefined)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [noSuggestions, setNoSuggestions] = useState(false)
  const [streamInitialized, setStreamInitialized] = useState(false)
  const router = useRouter()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const originalDescRef = useRef<string | null>(null)
  const cleanOriginalDescRef = useRef<string | null>(null)
  const [isSummaryStreaming, setIsSummaryStreaming] = useState(false)
  const { summary, summarize, error: summaryError, isLoading: isLoadingSummary } = useUrlSummary()

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

  const { saveStatus, cancelAutoSave } = useAutoSave<FormValues>({
    form,
    onSave: async (data: FormValues) => {
      const cleanedValues = {
        ...data,
        title: data.title.trim(),
        url: data.url.trim(),
        description: data.description?.trim() || '',
        tags: data.tags.map((tag: string) => tag.trim()).filter((tag: string) => tag !== ''),
      }

      const result = await onSubmit(cleanedValues, true)

      if (result.success) {
        if (result.linkId && linkId !== result.linkId) {
          setLinkId(result.linkId)
        }

        router.refresh()
      }
    },
    delay: 1000,
    linkId: linkId,
    disabled: isSummaryStreaming,
  })

  const urlValue = form.watch('url')
  const [debouncedUrl] = useDebounce(urlValue, 400)

  useEffect(() => {
    const currentDesc = form.getValues('description') || ''

    originalDescRef.current = currentDesc
    cleanOriginalDescRef.current = cleanHtmlContent(currentDesc)

    setStreamInitialized(false)
  }, [linkId, debouncedUrl])

  useEffect(() => {
    if (!summary || !summary.trim()) return

    const isHtml = summary.trim().startsWith('<')
    let htmlSummary = isHtml ? summary : `<p>${summary}</p>`

    // Limpiar el HTML del resumen si es necesario
    if (/<body[\s>]/i.test(htmlSummary)) {
      const match = htmlSummary.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      htmlSummary = match ? match[1] : htmlSummary
    }

    // Solo una vez, determinar si es nuevo o vacío
    const isNewLink = !defaultValues?.description && !linkId
    const isEmptyDescription = !cleanOriginalDescRef.current?.trim() || isDescriptionEmpty(cleanOriginalDescRef.current)
    const original = isNewLink || isEmptyDescription ? '' : cleanOriginalDescRef.current

    // SIEMPRE construir el description como summary + original limpio (nunca concatenar summary)
    form.setValue('description', `${htmlSummary}${original}`, { shouldDirty: true })

    // Solo inicializar el stream una vez
    if (!streamInitialized) setStreamInitialized(true)
  }, [summary])

  useEffect(() => {
    if (titleInputRef.current && !isEditing) {
      titleInputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    setIsSummaryStreaming(isLoadingSummary)
  }, [isLoadingSummary])

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
      cancelAutoSave()

      const result = await onSubmit(cleanedValues, false)

      if (result.success && result.linkId) {
        setLinkId(result.linkId)
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
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder='Link title'
                  {...field}
                  ref={titleInputRef}
                  className='h-12' // Input más alto
                />
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
                <div className='space-y-2'>
                  <Input
                    placeholder='https://johnserrano.co'
                    className='h-12' // Input más alto
                    {...field}
                    onBlur={async () => {
                      field.onBlur?.()
                      if (field.value) await summarize(field.value)
                    }}
                  />
                  {isLoadingSummary && (
                    <div className='flex items-start gap-2 p-3 text-sm text-yellow-600 bg-yellow-50 rounded-md'>
                      <Loader2 className='h-4 w-4 mt-0.5 flex-shrink-0 animate-spin' />
                      <div>
                        <p className='font-medium'>Generating summary...</p>
                      </div>
                    </div>
                  )}
                  {summaryError && (
                    <div className='text-red-500 p-4 bg-red-50 rounded-md'>
                      {summaryError.message}
                      {summaryError.isBlocked && (
                        <p className='mt-2 text-sm'>Este sitio podría estar bloqueando solicitudes automatizadas.</p>
                      )}
                    </div>
                  )}
                </div>
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
                <div className='min-h-[300px]'>
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={newValue => {
                      field.onChange(newValue)
                    }}
                    className='min-h-[300px]'
                  />
                </div>
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

        {!isEditing && (
          <Button type='submit' disabled={isSubmitting || saveStatus === 'saving'}>
            {(isSubmitting || saveStatus === 'saving') && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isSubmitting || saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </Button>
        )}
      </form>
    </Form>
  )
}
