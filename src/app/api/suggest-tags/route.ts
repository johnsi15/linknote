import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: NextRequest) {
  const { url, title, description, tags } = await req.json()

  const prompt = `
      Basándote en la siguiente información:
      URL: ${url}
      Título: ${title}
      Descripción: ${description}
      Tags existentes: ${tags.join(', ')}

      Sugiere 5 etiquetas relevantes.

      Los tags deben ser:
        - Palabras clave relevantes
        - En español (o el idioma del contenido)
        - Específicos y útiles para categorización
        - Sin caracteres especiales o espacios (usa guiones si es necesario)
        
      Responde solo con los tags separados por comas, sin explicaciones adicionales.
    `

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
    temperature: 0.75,
    maxTokens: 100,
  })

  const newTags = text
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)

  return Response.json({ tags: newTags })
}
