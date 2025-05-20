import { db } from '@/db'
import { tags, linkTags } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { getSecureSession } from '@/lib/auth/server'
import { nanoid } from 'nanoid'

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
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar tag:', error)
    return { success: false, error: `The tag could not be removed` }
  }
}
