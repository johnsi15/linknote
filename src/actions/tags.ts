import { db } from '@/db'
import { tags, linkTags } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { getSecureSession } from '@/lib/auth/server'
import { nanoid } from 'nanoid'
import { storeTagEmbedding, updateTagEmbedding, deleteTagEmbedding } from '@/lib/upstash-vector'

export async function getUserTags() {
  try {
    const { userId } = await getSecureSession()

    if (!userId) {
      console.error('No user ID found in session')
      return []
    }

    const userTags = await db.query.tags.findMany({
      where: eq(tags.userId, userId),
    })

    const tagsWithCount = await Promise.all(
      userTags.map(async tag => {
        const countResult = await db.select({ count: count() }).from(linkTags).where(eq(linkTags.tagId, tag.id))

        const countValue = Number(countResult[0]?.count ?? 0)

        return {
          id: tag.id,
          name: tag.name,
          count: countValue,
          createdAt: tag.createdAt,
        }
      })
    )

    return tagsWithCount
  } catch (error) {
    console.error('Error al obtener tags:', error)
    return []
  }
}

export async function addTag(name: string) {
  try {
    const { userId } = await getSecureSession()
    if (!userId) return { success: false, error: 'No user ID found' }

    const existing = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    })

    if (existing) return { success: false, error: 'Tag already exists' }

    const tagId = nanoid()
    const [newTag] = await db.insert(tags).values({ id: tagId, name, userId }).returning()
    
    // Generar embedding automáticamente para el nuevo tag
    try {
      await storeTagEmbedding({
        tagId: newTag.id,
        tagName: newTag.name,
        userId: userId
      })
    } catch (error) {
      // Log del error pero no fallar la creación del tag
      console.warn('Failed to generate embedding for new tag:', error)
    }
    
    return { success: true, tag: newTag }
  } catch (error) {
    console.error('Error al agregar tag:', error)
    return { success: false, error: 'No se pudo agregar el tag' }
  }
}

export async function updateTag(id: string, name: string) {
  try {
    const { userId } = await getSecureSession()
    if (!userId) return { success: false, error: 'No user ID found' }

    const existing = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    })

    if (existing && existing.id !== id) return { success: false, error: 'Tag name already in use' }

    const updated = await db.update(tags).set({ name }).where(eq(tags.id, id)).returning()

    // Actualizar embedding automáticamente para el tag modificado
    try {
      await updateTagEmbedding({
        tagId: updated[0].id,
        tagName: updated[0].name,
        userId: userId
      })
    } catch (error) {
      // Log del error pero no fallar la actualización del tag
      console.warn('Failed to update embedding for tag:', error)
    }

    return { success: true, tag: updated[0] }
  } catch (error) {
    console.error('Error al actualizar tag:', error)
    return { success: false, error: 'No se pudo actualizar el tag' }
  }
}

export async function deleteTag(id: string) {
  try {
    const { userId } = await getSecureSession()
    if (!userId) return { success: false, error: 'No user ID found' }

    const countResult = await db.select({ count: count() }).from(linkTags).where(eq(linkTags.tagId, id))

    const linksCount = Number(countResult[0]?.count ?? 0)

    if (linksCount > 0) {
      return {
        success: false,
        error: `This tag is used by ${linksCount} link${
          linksCount > 1 ? 's' : ''
        }. Remove the tag from all links first.`,
      }
    }

    await db.delete(tags).where(eq(tags.id, id))
    
    // Eliminar embedding automáticamente
    try {
      await deleteTagEmbedding(id)
    } catch (error) {
      // Log del error pero no fallar la eliminación del tag
      console.warn('Failed to delete embedding for tag:', error)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar tag:', error)
    return { success: false, error: `The tag could not be removed` }
  }
}

export async function getUserTagsPaginated({
  limit,
  offset,
  search,
}: {
  limit: number
  offset: number
  search?: string
}) {
  try {
    const { userId } = await getSecureSession()

    if (!userId) {
      console.error('No user ID found in session')
      return { tags: [], total: 0 }
    }

    let userTags = await db.query.tags.findMany({
      where: eq(tags.userId, userId),
    })

    if (search && search.trim() !== '') {
      userTags = userTags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()))
    }

    const total = userTags.length
    const paginated = userTags.slice(offset, offset + limit)

    const tagsWithCount = await Promise.all(
      paginated.map(async tag => {
        const countResult = await db.select({ count: count() }).from(linkTags).where(eq(linkTags.tagId, tag.id))
        const countValue = Number(countResult[0]?.count ?? 0)
        return {
          id: tag.id,
          name: tag.name,
          count: countValue,
          createdAt: tag.createdAt,
        }
      })
    )

    return { tags: tagsWithCount, total }
  } catch (error) {
    console.error('Error al obtener tags paginados:', error)
    return { tags: [], total: 0 }
  }
}
