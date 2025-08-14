'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { links, linkTags, tags } from '@/db/schema'
import { eq, and, inArray, or, like, sql, asc, desc, gte, lte, SQLWrapper, countDistinct } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getSecureSession } from '@/lib/auth/server'
import { z } from 'zod'
import { linkSchema } from '@/lib/validations/link'

export type LinkFormData = z.infer<typeof linkSchema>

interface GetUserLinksFilteredParams {
  userId: string
  search?: string
  tags?: string[]
  dateRange?: string
  sort?: string // 'newest', 'oldest', 'titleAsc', 'titleDesc'
  onlyFavorites?: boolean
  limit?: number
  offset?: number // Para paginación
}

export async function saveLink(formData: LinkFormData, isUpdate: boolean = false, linkId?: string) {
  try {
    const validatedData = linkSchema.parse(formData)

    if (isUpdate && linkId) {
      // Actualizar un enlace existente (PUT)
      return await updateLink(linkId, validatedData)
    } else {
      // Crear un nuevo enlace (POST)
      return await createLink(validatedData)
    }
  } catch (error) {
    console.error('Error al guardar enlace:', error)
    return { success: false, error: 'No se pudo guardar el enlace' }
  }
}

// Crear un nuevo enlace
export async function createLink(formData: LinkFormData) {
  try {
    const { userId } = await getSecureSession()
    const validatedData = linkSchema.parse(formData)

    const linkId = nanoid()

    // Insertar el enlace
    await db.insert(links).values({
      id: linkId,
      userId,
      title: validatedData.title,
      url: validatedData.url,
      description: validatedData.description || '',
      isFavorite: validatedData.isFavorite || false,
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
    revalidatePath(`/links/${linkId}`)
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
      return { success: false, error: 'Link no found' }
    }

    const linkTagsRows = await db.select({ tagId: linkTags.tagId }).from(linkTags).where(eq(linkTags.linkId, link.id))

    const tagNames = []

    if (linkTagsRows.length > 0) {
      const tagIds = linkTagsRows.map(row => row.tagId)
      const tagRows = await db.select({ name: tags.name }).from(tags).where(inArray(tags.id, tagIds))

      tagNames.push(...tagRows.map(t => t.name))
    }

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
export async function getUserLinks({ tag }: { tag?: string } = {}) {
  try {
    const { userId } = await getSecureSession()

    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    if (tag) {
      const tagRow = await db
        .select({ id: tags.id })
        .from(tags)
        .where(and(eq(sql`LOWER(${tags.name})`, tag.toLowerCase()), eq(tags.userId, userId)))
        .limit(1)

      if (tagRow.length === 0) {
        return { success: true, links: [] }
      }

      const tagId = tagRow[0].id

      const linkIds = await db.select({ linkId: linkTags.linkId }).from(linkTags).where(eq(linkTags.tagId, tagId))

      if (linkIds.length === 0) {
        return { success: true, links: [] }
      }

      const userLinks = await db
        .select({
          id: links.id,
          userId: links.userId,
          title: links.title,
          url: links.url,
          description: links.description,
          isFavorite: links.isFavorite,
          createdAt: links.createdAt,
          updatedAt: links.updatedAt,
        })
        .from(links)
        .innerJoin(linkTags, eq(links.id, linkTags.linkId))
        .where(and(eq(links.userId, userId), eq(linkTags.tagId, tagId)))
        .orderBy(desc(links.createdAt))

      const userLinkIds = userLinks.map(link => link.id)

      const allLinkTags = await db
        .select({
          linkId: linkTags.linkId,
          tagName: tags.name,
        })
        .from(linkTags)
        .innerJoin(tags, eq(linkTags.tagId, tags.id))
        .where(inArray(linkTags.linkId, userLinkIds))

      const tagsByLinkId = allLinkTags.reduce((acc, { linkId, tagName }) => {
        if (!acc[linkId]) {
          acc[linkId] = []
        }

        acc[linkId].push(tagName)

        return acc
      }, {} as Record<string, string[]>)

      const linksWithTags = userLinks.map(link => ({
        ...link,
        tags: tagsByLinkId[link.id] || [],
      }))

      return { success: true, links: linksWithTags }
    }

    const userLinks = await db.query.links.findMany({
      where: eq(links.userId, userId),
      orderBy: (links, { desc }) => [desc(links.createdAt)],
    })

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
      return { success: false, error: 'Link no found' }
    }

    await db
      .update(links)
      .set({
        title: validatedData.title,
        url: validatedData.url,
        description: validatedData.description || '',
        isFavorite: validatedData.isFavorite !== undefined ? validatedData.isFavorite : existingLink.isFavorite,
        updatedAt: new Date(),
      })
      .where(eq(links.id, id))

    // Eliminar relaciones de etiquetas existentes
    await db.delete(linkTags).where(eq(linkTags.linkId, id))

    // Procesar etiquetas nuevamente
    if (validatedData.tags.length > 0) {
      const uniqueTags = Array.from(new Set(validatedData.tags))

      const existingTags = await db.query.tags.findMany({
        where: eq(tags.userId, userId),
      })

      const existingTagNames = existingTags.map(tag => tag.name)
      const existingTagsMap = Object.fromEntries(existingTags.map(tag => [tag.name, tag.id]))

      // Crear nuevas etiquetas si es necesario
      const newTags = uniqueTags.filter(tag => !existingTagNames.includes(tag))

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
    return { success: true, linkId: existingLink.id }
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
    revalidatePath(`/links/${id}`)
    return { success: true, id }
  } catch (error) {
    console.error('Error al eliminar enlace:', error)
    return { success: false, error: 'No se pudo eliminar el enlace' }
  }
}

export type Link = typeof links.$inferSelect
export type Tag = typeof tags.$inferSelect

export async function getUserLinksFiltered({
  userId,
  search = '',
  tags: tagNames = [],
  dateRange = 'all',
  sort = 'newest',
  onlyFavorites = false,
  limit = 30,
  offset = 0, //  Añadimos offset para paginación
}: GetUserLinksFilteredParams): Promise<{
  links: (Omit<Link, 'userId' | 'updatedAt'> & { tags: string[] })[]
  total: number
}> {
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const allWhereConditions: SQLWrapper[] = []

  allWhereConditions.push(eq(links.userId, userId))

  if (onlyFavorites) {
    allWhereConditions.push(eq(links.isFavorite, true))
  }

  // Filtro de Búsqueda (search)
  if (search && search.trim() !== '') {
    const searchLower = search.trim().toLowerCase()
    const searchPattern = `%${searchLower}%`

    const searchOrCondition = or(
      like(sql`lower(${links.title})`, searchPattern),
      links.description ? like(sql`lower(${links.description})`, searchPattern) : undefined,
      like(sql`lower(${links.url})`, searchPattern),
      like(sql`lower(${tags.name})`, searchPattern)
    )

    if (searchOrCondition) {
      allWhereConditions.push(searchOrCondition)
    }
  }

  // 2. Filtro de Tags
  if (tagNames.length > 0) {
    allWhereConditions.push(inArray(tags.name, tagNames))
    allWhereConditions.push(eq(tags.userId, userId))
  }

  // 3. Filtro de Rango de Fechas (dateRange)
  const now = new Date()
  let startDateFilter: Date | null = null
  let endDateFilter: Date | null = null

  switch (dateRange) {
    case 'today':
      startDateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      endDateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      break
    case 'yesterday':
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      startDateFilter = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0)
      endDateFilter = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999)
      break
    case 'week':
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(now.getDate() - 7)
      startDateFilter = new Date(
        sevenDaysAgo.getFullYear(),
        sevenDaysAgo.getMonth(),
        sevenDaysAgo.getDate(),
        0,
        0,
        0,
        0
      )
      endDateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      break
    case 'month':
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(now.getDate() - 30) // Setea al inicio del día hace 30 días
      startDateFilter = new Date(
        thirtyDaysAgo.getFullYear(),
        thirtyDaysAgo.getMonth(),
        thirtyDaysAgo.getDate(),
        0,
        0,
        0,
        0
      )
      endDateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999) // Hasta el final de hoy
      break
  }

  if (startDateFilter) {
    allWhereConditions.push(gte(links.createdAt, startDateFilter))
  }
  if (endDateFilter) {
    allWhereConditions.push(lte(links.createdAt, endDateFilter))
  }

  const finalWhereClause = allWhereConditions.length > 0 ? and(...allWhereConditions) : undefined

  // --- Consulta para el total (sin paginación) ---
  let countQuery = db
    .select({ count: sql<number>`COUNT(DISTINCT ${links.id})` })
    .from(links)
    .leftJoin(linkTags, eq(links.id, linkTags.linkId))
    .leftJoin(tags, eq(linkTags.tagId, tags.id))
    .$dynamic()

  if (finalWhereClause) {
    countQuery = countQuery.where(finalWhereClause)
  }

  if (tagNames.length > 0) {
    countQuery = countQuery.groupBy(
      links.id,
      links.title,
      links.url,
      links.description,
      links.createdAt,
      links.isFavorite
    )
    countQuery = countQuery.having(eq(countDistinct(tags.id), tagNames.length))
  }

  let query = db
    .select({
      id: links.id,
      title: links.title,
      url: links.url,
      description: links.description,
      isFavorite: links.isFavorite,
      createdAt: links.createdAt,
      tagsString: sql<string | null>`GROUP_CONCAT(DISTINCT ${tags.name})`.as('tagsString'),
    })
    .from(links)
    .leftJoin(linkTags, eq(links.id, linkTags.linkId))
    .leftJoin(tags, eq(linkTags.tagId, tags.id))
    .$dynamic()

  if (finalWhereClause) {
    query = query.where(finalWhereClause)
  }

  query = query.groupBy(links.id, links.title, links.url, links.description, links.isFavorite, links.createdAt)

  if (tagNames.length > 0) {
    // Contamos los tags distintos que coinciden (después del WHERE) y verificamos si es igual al número de tags solicitados.
    query = query.having(eq(countDistinct(tags.id), tagNames.length))
  }

  // 4. Ordenamiento (sort)
  switch (sort) {
    case 'oldest':
      query = query.orderBy(asc(links.createdAt))
      break
    case 'az':
      query = query.orderBy(sql`lower(${links.title}) ASC`)
      break
    case 'za':
      query = query.orderBy(sql`lower(${links.title}) DESC`)
      break
    case 'newest':
    default:
      query = query.orderBy(desc(links.createdAt))
      break
  }

  // --- 6. Paginación (limit y offset) ---
  if (typeof limit === 'number' && limit > 0) {
    query = query.limit(limit)
  }

  if (typeof offset === 'number' && offset > 0) {
    query = query.offset(offset)
  }

  try {
    const countResult = await countQuery.execute()
    const total = countResult?.[0]?.count ?? 0

    const rows = await query.execute()

    const resultWithTagsArray = rows.map(row => {
      return {
        id: row.id,
        title: row.title,
        url: row.url,
        description: row.description,
        isFavorite: row.isFavorite,
        createdAt: row.createdAt,
        tags: row.tagsString ? row.tagsString.split(',').filter(t => t) : [],
      }
    })

    return { links: resultWithTagsArray, total }
  } catch (error) {
    console.error('Error fetching filtered links:', error)
    throw new Error('Could not retrieve links.')
  }
}

// Toggle favorite status de un link
export async function toggleFavoriteLink(linkId: string) {
  try {
    const { userId } = await getSecureSession()

    if (!linkId) {
      return { success: false, error: 'Link ID is required' }
    }

    // Obtener el link actual para verificar ownership y obtener el estado actual
    const existingLink = await db
      .select({ isFavorite: links.isFavorite })
      .from(links)
      .where(and(eq(links.id, linkId), eq(links.userId, userId)))
      .limit(1)

    if (existingLink.length === 0) {
      return { success: false, error: 'Link not found' }
    }

    // Toggle el estado de favorito
    const newFavoriteStatus = !existingLink[0].isFavorite

    await db
      .update(links)
      .set({
        isFavorite: newFavoriteStatus,
        updatedAt: new Date(),
      })
      .where(and(eq(links.id, linkId), eq(links.userId, userId)))

    // Revalidar las páginas que podrían estar cacheadas
    revalidatePath('/links')
    revalidatePath('/dashboard')

    return {
      success: true,
      linkId,
      isFavorite: newFavoriteStatus,
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return { success: false, error: 'Could not toggle favorite status' }
  }
}

// Obtener todos los links favoritos del usuario
export async function getUserFavoriteLinks() {
  try {
    const { userId } = await getSecureSession()

    const favoriteLinks = await db.query.links.findMany({
      where: and(eq(links.userId, userId), eq(links.isFavorite, true)),
      orderBy: (links, { desc }) => [desc(links.createdAt)],
    })

    // Obtener los tags para cada link favorito
    const linksWithTags = await Promise.all(
      favoriteLinks.map(async link => {
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
    console.error('Error al obtener enlaces favoritos:', error)
    return { success: false, error: 'Could not get favorite links' }
  }
}
