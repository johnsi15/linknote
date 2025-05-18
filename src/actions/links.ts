'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { links, linkTags, tags } from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getSecureSession } from '@/lib/auth/server'
import { z } from 'zod'

// Esquema de validación para crear/actualizar enlaces
const linkSchema = z.object({
  title: z
    .string()
    .min(1, 'The title is required')
    .transform(val => val.trim()),
  url: z
    .string()
    .url('URL invalid')
    .transform(val => val.trim()),
  description: z
    .string()
    .optional()
    .transform(val => val?.trim() || ''),
  tags: z.array(z.string().transform(val => val.trim())).default([]),
})

export type LinkFormData = z.infer<typeof linkSchema>

interface TagRelation {
  tag: {
    name: string
    id: string
  }
}

// Crear un nuevo enlace
export async function createLink(formData: LinkFormData) {
  try {
    const { userId } = await getSecureSession()
    const validatedData = linkSchema.parse(formData)

    const linkId = nanoid()

    console.log({ userId, linkId, validatedData })

    // Insertar el enlace
    await db.insert(links).values({
      id: linkId,
      userId,
      title: validatedData.title,
      url: validatedData.url,
      description: validatedData.description || '',
    })

    // Procesar etiquetas
    if (validatedData.tags.length > 0) {
      // Obtener etiquetas existentes del usuario
      const existingTags = await db.query.tags.findMany({
        where: and(
          eq(tags.userId, userId),
          validatedData.tags.length > 0 ? inArray(tags.name, validatedData.tags) : undefined
        ),
      })

      const existingTagNames = existingTags.map(tag => tag.name)

      // Crear nuevas etiquetas si es necesario
      const newTags = validatedData.tags.filter(tag => !existingTagNames.includes(tag))

      if (newTags.length > 0) {
        await db.insert(tags).values(
          newTags.map(tagName => ({
            id: nanoid(),
            name: tagName,
            userId,
          }))
        )
      }

      // Obtener todas las etiquetas para este enlace
      const allTags = await db.query.tags.findMany({
        where: and(eq(tags.userId, userId), inArray(tags.name, validatedData.tags)),
      })

      // Crear relaciones entre enlace y etiquetas
      await db.insert(linkTags).values(
        allTags.map(tag => ({
          linkId,
          tagId: tag.id,
        }))
      )
    }

    revalidatePath('/dashboard')
    return { success: true, linkId }
  } catch (error) {
    console.error('Error al crear enlace:', error)
    return { success: false, error: 'No se pudo crear el enlace' }
  }
}

// Obtener un enlace por ID
export async function getLinkById(id: string) {
  try {
    const { userId } = await getSecureSession()

    const link = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.userId, userId)),
    })

    if (!link) {
      return { success: false, error: 'Enlace no encontrado' }
    }

    // Obtener etiquetas asociadas al enlace
    const linkTagsRelations = (await db.query.linkTags.findMany({
      where: eq(linkTags.linkId, id),
      with: {
        tag: true,
      },
    })) as TagRelation[]

    const tagNames = linkTagsRelations.map(relation => relation.tag.name)

    return {
      success: true,
      link: {
        ...link,
        tags: tagNames,
      },
    }
  } catch (error) {
    console.error('Error al obtener enlace:', error)
    return { success: false, error: 'No se pudo obtener el enlace' }
  }
}

// Obtener todos los enlaces del usuario
export async function getUserLinks() {
  try {
    const { userId } = await getSecureSession()

    const userLinks = await db.query.links.findMany({
      where: eq(links.userId, userId),
      orderBy: (links, { desc }) => [desc(links.createdAt)],
    })

    // Para cada enlace, obtener sus etiquetas
    const linksWithTags = await Promise.all(
      userLinks.map(async link => {
        const linkTagsRows = await db
          .select({ tagId: linkTags.tagId })
          .from(linkTags)
          .where(eq(linkTags.linkId, link.id))

        const tagNames = []

        if (linkTagsRows.length > 0) {
          const tagIds = linkTagsRows.map(row => row.tagId)
          const tagRows = await db.select({ name: tags.name }).from(tags).where(inArray(tags.id, tagIds))

          tagNames.push(...tagRows.map(t => t.name))
        }

        return {
          ...link,
          tags: tagNames,
        }
      })
    )

    return { success: true, links: linksWithTags }
  } catch (error) {
    console.error('Error al obtener enlaces:', error)
    return { success: false, error: 'Could not get links' }
  }
}

// Actualizar un enlace existente
export async function updateLink(id: string, formData: LinkFormData) {
  try {
    const { userId } = await getSecureSession()
    const validatedData = linkSchema.parse(formData)

    // Verificar que el enlace pertenece al usuario
    const existingLink = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.userId, userId)),
    })

    if (!existingLink) {
      return { success: false, error: 'Enlace no encontrado' }
    }

    // Actualizar el enlace
    await db
      .update(links)
      .set({
        title: validatedData.title,
        url: validatedData.url,
        description: validatedData.description || '',
        updatedAt: new Date(),
      })
      .where(eq(links.id, id))

    // Eliminar relaciones de etiquetas existentes
    await db.delete(linkTags).where(eq(linkTags.linkId, id))

    // Procesar etiquetas nuevamente
    if (validatedData.tags.length > 0) {
      // Obtener etiquetas existentes del usuario
      const existingTags = await db.query.tags.findMany({
        where: eq(tags.userId, userId),
      })

      const existingTagNames = existingTags.map(tag => tag.name)
      const existingTagsMap = Object.fromEntries(existingTags.map(tag => [tag.name, tag.id]))

      // Crear nuevas etiquetas si es necesario
      const newTags = validatedData.tags.filter(tag => !existingTagNames.includes(tag))

      if (newTags.length > 0) {
        const newTagsData = newTags.map(tagName => ({
          id: nanoid(),
          name: tagName,
          userId,
        }))

        await db.insert(tags).values(newTagsData)

        // Actualizar el mapa de etiquetas con las nuevas
        newTagsData.forEach(tag => {
          existingTagsMap[tag.name] = tag.id
        })
      }

      // Crear relaciones entre enlace y etiquetas
      const linkTagsData = validatedData.tags.map(tagName => ({
        linkId: id,
        tagId: existingTagsMap[tagName],
      }))

      await db.insert(linkTags).values(linkTagsData)
    }

    revalidatePath('/dashboard')
    revalidatePath(`/links/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar enlace:', error)
    return { success: false, error: 'No se pudo actualizar el enlace' }
  }
}

// Eliminar un enlace
export async function deleteLink(id: string) {
  try {
    const { userId } = await getSecureSession()

    // Verificar que el enlace pertenece al usuario
    const existingLink = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.userId, userId)),
    })

    if (!existingLink) {
      return { success: false, error: 'Enlace no encontrado' }
    }

    // Las relaciones linkTags se eliminarán automáticamente por la restricción ON DELETE CASCADE
    await db.delete(links).where(eq(links.id, id))

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar enlace:', error)
    return { success: false, error: 'No se pudo eliminar el enlace' }
  }
}
