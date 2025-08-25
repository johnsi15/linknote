import Dexie, { Table } from 'dexie'

// Interfaces para Dexie (versiones offline de los tipos existentes)
export interface OfflineLink {
  id: string
  userId: string
  title: string
  url: string
  description: string | null
  isFavorite: boolean
  tags: string[] // Array de nombres de tags para facilitar consultas
  createdAt: Date
  updatedAt: Date
  // Campos para sincronización
  synced: boolean // Indica si está sincronizado con el backend
  lastModified: Date // Timestamp de última modificación local
}

export interface OfflineTag {
  id: string
  name: string
  userId: string
  createdAt: Date
  // Campos para sincronización
  synced: boolean
  lastModified: Date
}

export interface OfflineLinkTag {
  linkId: string
  tagId: string
  createdAt: Date
  synced: boolean
  lastModified: Date
}

// Tipos de operaciones para la cola de sincronización
export type QueueOperationType = 'create' | 'update' | 'delete'
export type QueueEntityType = 'link' | 'tag' | 'linkTag'

export interface SyncQueueItem {
  id: string // ID único de la operación en la cola
  entityType: QueueEntityType
  operationType: QueueOperationType
  entityId: string // ID de la entidad afectada
  data?: unknown // Datos de la operación (para create/update)
  timestamp: Date
  attempts: number
  lastAttempt?: Date
  error?: string
}

// Definición de la base de datos Dexie
export class LinknoteDB extends Dexie {
  // Tablas principales
  links!: Table<OfflineLink, string>
  tags!: Table<OfflineTag, string>
  linkTags!: Table<OfflineLinkTag, string>

  // Cola de sincronización
  syncQueue!: Table<SyncQueueItem, string>

  constructor() {
    super('linknote')

    this.version(1).stores({
      // Tabla de links con índices para búsquedas eficientes
      links: 'id, userId, title, url, updatedAt, synced, lastModified, *tags',

      // Tabla de tags con índices
      tags: 'id, name, userId, synced, lastModified',

      // Tabla de relaciones link-tag
      linkTags: '[linkId+tagId], linkId, tagId, synced, lastModified',

      // Cola de sincronización con índices para procesamiento
      syncQueue: 'id, entityType, operationType, timestamp, attempts',
    })

    this.version(2)
      .stores({
        // Tabla de links con índices para búsquedas eficientes y nuevo campo isFavorite
        links: 'id, userId, title, url, isFavorite, updatedAt, synced, lastModified, *tags',

        // Tabla de tags con índices (sin cambios)
        tags: 'id, name, userId, synced, lastModified',

        // Tabla de relaciones link-tag (sin cambios)
        linkTags: '[linkId+tagId], linkId, tagId, synced, lastModified',

        // Cola de sincronización con índices para procesamiento (sin cambios)
        syncQueue: 'id, entityType, operationType, timestamp, attempts',
      })
      .upgrade(trans => {
        // Migración: agregar isFavorite = false a todos los links existentes
        return trans
          .table('links')
          .toCollection()
          .modify((link: Partial<OfflineLink>) => {
            link.isFavorite = false
          })
      })

    // Hooks para mantener timestamps actualizados
    this.links.hook('creating', (primKey, obj) => {
      const now = new Date()
      obj.createdAt = obj.createdAt || now
      obj.updatedAt = now
      obj.lastModified = now
      obj.synced = obj.synced ?? false
      obj.tags = obj.tags || []
    })

    this.links.hook('updating', modifications => {
      const now = new Date()
      ;(modifications as Partial<OfflineLink>).updatedAt = now
      ;(modifications as Partial<OfflineLink>).lastModified = now
      ;(modifications as Partial<OfflineLink>).synced = false // Marcar como no sincronizado al actualizar
    })

    this.tags.hook('creating', (primKey, obj) => {
      const now = new Date()
      obj.createdAt = obj.createdAt || now
      obj.lastModified = now
      obj.synced = obj.synced ?? false
    })

    this.tags.hook('updating', modifications => {
      const now = new Date()
      ;(modifications as Partial<OfflineTag>).lastModified = now
      ;(modifications as Partial<OfflineTag>).synced = false
    })

    this.linkTags.hook('creating', (primKey, obj) => {
      const now = new Date()
      obj.createdAt = obj.createdAt || now
      obj.lastModified = now
      obj.synced = obj.synced ?? false
    })

    this.linkTags.hook('updating', modifications => {
      const now = new Date()
      ;(modifications as Partial<OfflineLinkTag>).lastModified = now
      ;(modifications as Partial<OfflineLinkTag>).synced = false
    })

    this.syncQueue.hook('creating', (primKey, obj) => {
      obj.timestamp = obj.timestamp || new Date()
      obj.attempts = obj.attempts || 0
    })
  }

  // Métodos auxiliares para operaciones comunes

  /**
   * Obtiene todos los links con sus tags para un usuario
   */
  async getLinksWithTags(userId: string): Promise<OfflineLink[]> {
    return await this.links.where('userId').equals(userId).reverse().sortBy('updatedAt')
  }

  /**
   * Obtiene un link específico con sus tags
   */
  async getLinkWithTags(linkId: string): Promise<OfflineLink | undefined> {
    return await this.links.get(linkId)
  }

  /**
   * Busca links por título o URL
   */
  async searchLinks(userId: string, query: string): Promise<OfflineLink[]> {
    const searchTerm = query.toLowerCase()
    return await this.links
      .where('userId')
      .equals(userId)
      .filter(link => {
        const titleMatch = link.title.toLowerCase().includes(searchTerm)
        const urlMatch = link.url.toLowerCase().includes(searchTerm)
        const descriptionMatch = link.description ? link.description.toLowerCase().includes(searchTerm) : false

        return titleMatch || urlMatch || descriptionMatch
      })
      .reverse()
      .sortBy('updatedAt')
  }

  /**
   * Obtiene links filtrados por tag
   */
  async getLinksByTag(userId: string, tagName: string): Promise<OfflineLink[]> {
    return await this.links
      .where('userId')
      .equals(userId)
      .filter(link => link.tags.includes(tagName))
      .reverse()
      .sortBy('updatedAt')
  }

  /**
   * Obtiene todos los tags para un usuario con su conteo de uso
   */
  async getTagsWithCount(userId: string): Promise<Array<OfflineTag & { count: number }>> {
    const tags = await this.tags.where('userId').equals(userId).toArray()
    const links = await this.links.where('userId').equals(userId).toArray()

    return tags.map(tag => {
      const count = links.filter(link => link.tags.includes(tag.name)).length
      return { ...tag, count }
    })
  }

  /**
   * Agrega un item a la cola de sincronización
   */
  async addToSyncQueue(
    entityType: QueueEntityType,
    operationType: QueueOperationType,
    entityId: string,
    data?: unknown
  ): Promise<string> {
    const queueItem: SyncQueueItem = {
      id: `${entityType}_${operationType}_${entityId}_${Date.now()}`,
      entityType,
      operationType,
      entityId,
      data,
      timestamp: new Date(),
      attempts: 0,
    }

    await this.syncQueue.add(queueItem)
    return queueItem.id
  }

  /**
   * Obtiene items pendientes de sincronización
   */
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    return await this.syncQueue
      .where('attempts')
      .below(3) // Máximo 3 intentos
      .sortBy('timestamp')
  }

  /**
   * Marca un item de la cola como procesado exitosamente
   */
  async markSyncItemAsProcessed(queueItemId: string): Promise<void> {
    await this.syncQueue.delete(queueItemId)
  }

  /**
   * Incrementa el contador de intentos de un item de la cola
   */
  async incrementSyncAttempts(queueItemId: string, error?: string): Promise<void> {
    const item = await this.syncQueue.get(queueItemId)
    if (item) {
      await this.syncQueue.update(queueItemId, {
        attempts: item.attempts + 1,
        lastAttempt: new Date(),
        error,
      })
    }
  }

  /**
   * Limpia items de la cola que han fallado demasiadas veces
   */
  async cleanupFailedSyncItems(): Promise<void> {
    await this.syncQueue.where('attempts').aboveOrEqual(3).delete()
  }
}

// Instancia única de la base de datos
export const db = new LinknoteDB()
