'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { TagInput } from '@/components/dashboard/tag-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface NewLinkFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export default function NewLinkForm({ onCancel, onSuccess }: NewLinkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [suggestedDescription, setSuggestedDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const router = useRouter()

  // Mock function to simulate AI suggestions
  const generateSuggestions = async () => {
    if (!url) {
      toast.error('URL requerida', {
        description: 'Por favor ingresa una URL para generar sugerencias',
      })
      return
    }

    setIsGenerating(true)

    // Simulate API call
    try {
      const res = await fetch('/api/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title, description }),
      })
      const data = await res.json()
      setSuggestedTags(data.tags)
      // Si quieres también puedes pedir descripción a la IA y setearla aquí
      toast.success('Sugerencias generadas', {
        description: 'La IA ha analizado la URL y proporcionado sugerencias',
      })
    } catch (err) {
      console.log(err)
      toast.error('Error al generar sugerencias')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      // Mock response
      const newLinkId = Math.random().toString(36).substring(2, 9)

      toast.success('Link guardado', {
        description: 'Tu link ha sido guardado exitosamente.',
      })
      setIsSubmitting(false)

      onSuccess()
    }, 1000)
  }

  const handleUseSuggestion = () => {
    setDescription(suggestedDescription)
    setTags([...new Set([...tags, ...suggestedTags])])

    toast.success('Sugerencias aplicadas', {
      description: 'Las sugerencias de IA han sido aplicadas a tu link',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='url'>URL</Label>
          <div className='flex space-x-2'>
            <Input
              id='url'
              placeholder='https://ejemplo.com'
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
            />
            <Button
              type='button'
              variant='outline'
              onClick={generateSuggestions}
              disabled={isGenerating}
              className='gap-2 whitespace-nowrap'
            >
              <SparklesIcon className='h-4 w-4' />
              {isGenerating ? 'Generando...' : 'Generar Sugerencias IA'}
            </Button>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='title'>Título</Label>
          <Input
            id='title'
            placeholder='Ingresa un título'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Descripción</Label>
          <Tabs defaultValue='manual'>
            <TabsList className='mb-2'>
              <TabsTrigger value='manual'>Manual</TabsTrigger>
              <TabsTrigger value='ai-suggestion' disabled={!suggestedDescription}>
                Sugerencia IA
              </TabsTrigger>
            </TabsList>
            <TabsContent value='manual'>
              <textarea
                id='description'
                className='flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                placeholder='Ingresa una descripción'
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </TabsContent>
            <TabsContent value='ai-suggestion'>
              <div className='border rounded-md p-4 bg-primary/5'>
                <p className='text-sm mb-2'>{suggestedDescription}</p>
                <Button type='button' size='sm' onClick={handleUseSuggestion} className='gap-2'>
                  <SparklesIcon className='h-3 w-3' />
                  Usar esta sugerencia
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='tags'>Etiquetas</Label>
          <TagInput
            placeholder='Añadir etiquetas...'
            tags={tags}
            setTags={setTags}
            suggestedTags={suggestedTags}
            onTagsChange={newTags => setTags(newTags)}
          />
        </div>
      </div>
      <div className='flex justify-end space-x-2 mt-6'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Link'}
        </Button>
      </div>
    </form>
  )
}
