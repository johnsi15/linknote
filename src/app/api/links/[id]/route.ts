import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '@/db'
import { links, linkTags, tags } from '@/db/schema'
import { linkSchema } from '@/lib/validations/link'
import { getSecureSession } from '@/lib/auth/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await getSecureSession()
    const { id } = await params
    const formData = await request.json()

    const validatedData = linkSchema.parse(formData)

    // Verificar que el enlace pertenece al usuario
    const existingLink = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.userId, userId)),
    })

    if (!existingLink) {
      return NextResponse.json({ success: false, error: 'Enlace no encontrado' }, { status: 404 })
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

      // Crear relaciones entre enlace y etiquetas, eliminando duplicados
      const uniqueTagNames = [...new Set(validatedData.tags)]
      const linkTagsData = uniqueTagNames.map(tagName => ({
        linkId: id,
        tagId: existingTagsMap[tagName],
      }))

      // Usar insertIgnore o un enfoque personalizado para evitar duplicados
      try {
        await db.insert(linkTags).values(linkTagsData)
      } catch (error) {
        // Si hay un error de restricción única, insertamos uno por uno ignorando errores
        for (const linkTag of linkTagsData) {
          try {
            await db.insert(linkTags).values(linkTag)
          } catch (err) {
            // Ignorar errores de restricción única
            if (!(err instanceof Error) || !err.message.includes('UNIQUE constraint failed')) {
              throw err
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, linkId: id })
  } catch (error) {
    console.error('Error al actualizar enlace:', error)
    return NextResponse.json({ success: false, error: 'No se pudo actualizar el enlace' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await getSecureSession()
    const { id } = await params

    // Verificar que el enlace pertenece al usuario
    const existingLink = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.userId, userId)),
    })

    if (!existingLink) {
      return NextResponse.json({ success: false, error: 'Enlace no encontrado' }, { status: 404 })
    }

    // Las relaciones linkTags se eliminarán automáticamente por la restricción ON DELETE CASCADE
    await db.delete(links).where(eq(links.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar enlace:', error)
    return NextResponse.json({ success: false, error: 'No se pudo eliminar el enlace' }, { status: 500 })
  }
}
