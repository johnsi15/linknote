#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script para sincronizar tags existentes en Upstash Vector
 * usando embeddings integrados de Upstash.
 *
 * Uso: npm run sync-tags
 */

// Cargar variables de entorno
require('dotenv').config()

const { createClient } = require('@libsql/client')
const { Index } = require('@upstash/vector')

// Configuración de la base de datos
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Configuración de Upstash Vector
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

// Función para almacenar en Upstash Vector usando embeddings integrados
async function storeInUpstash(
  id: any,
  tagName: any,
  metadata: { name: any; created_at: any; updated_at: any; user_id?: any }
) {
  try {
    const result = await index.upsert({
      id: `tag-${id}`,
      data: tagName, // Upstash genera el embedding automáticamente
      metadata: {
        ...metadata,
        tagId: id,
        tagName: tagName,
        userId: metadata.user_id || 'system', // Agregar userId para filtering
        type: 'tag',
      },
    })

    console.log(`  ✅ Tag almacenado en Upstash: ${metadata.name}`)
    return result
  } catch (error) {
    console.error(`  ❌ Error almacenando en Upstash:`, error)
    throw error
  }
}

// Función para procesar tags en lotes
async function batchProcessTags(tags: any[]) {
  const BATCH_SIZE = 10
  const batches = []

  for (let i = 0; i < tags.length; i += BATCH_SIZE) {
    batches.push(tags.slice(i, i + BATCH_SIZE))
  }

  console.log(`📦 Procesando ${batches.length} lotes de hasta ${BATCH_SIZE} tags...`)

  interface Tag {
    id: string
    name: string
    created_at: string
    updated_at: string
    user_id?: string
  }

  for (const [batchIndex, batch] of batches.entries()) {
    console.log(`⚡ Procesando lote ${batchIndex + 1}/${batches.length}...`)

    const promises = (batch as Tag[]).map(async (tag: Tag) => {
      try {
        // Almacenar en Upstash (sin generar embedding manualmente)
        await storeInUpstash(tag.id, tag.name, {
          name: tag.name,
          created_at: tag.created_at,
          updated_at: tag.updated_at,
          user_id: tag.user_id || 'system', // Agregar user_id si existe
        })

        console.log(`  ✅ Tag procesado: ${tag.name}`)
        return { success: true, tag: tag.name }
      } catch (error) {
        console.error(`  ❌ Error procesando tag ${tag.name}:`, error)
        return { success: false, tag: tag.name, error: (error as Error).message }
      }
    })

    await Promise.all(promises)

    // Pequeña pausa entre lotes para no sobrecargar las APIs
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

async function syncExistingTags() {
  console.log('🏷️  Iniciando sincronización de tags existentes...')

  try {
    // Verificar variables de entorno
    const requiredVars = [
      'TURSO_DATABASE_URL',
      'TURSO_AUTH_TOKEN',
      'UPSTASH_VECTOR_REST_URL',
      'UPSTASH_VECTOR_REST_TOKEN',
    ]

    const missingVars = requiredVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
      console.error('❌ Faltan las siguientes variables de entorno:')
      missingVars.forEach(varName => console.error(`   - ${varName}`))
      process.exit(1)
    }

    console.log('✅ Variables de entorno verificadas')

    // Obtener todos los tags de la base de datos
    console.log('📊 Obteniendo tags de la base de datos...')
    const result = await db.execute('SELECT * FROM tags ORDER BY created_at DESC')
    const existingTags = result.rows

    if (existingTags.length === 0) {
      console.log('ℹ️  No se encontraron tags para procesar.')
      return
    }

    console.log(`📈 Se encontraron ${existingTags.length} tags para procesar`)

    // Procesar tags en lotes
    console.log('⚡ Generando embeddings...')
    await batchProcessTags(existingTags)

    console.log(`✅ Se procesaron exitosamente ${existingTags.length} tags`)
    console.log('🎉 Sincronización completada!')
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error)
    process.exit(1)
  }
}

// Ejecutar el script
async function main() {
  console.log('🚀 Script de sincronización de tags iniciado')

  await syncExistingTags()

  console.log('✨ Script completado exitosamente')
  process.exit(0)
}

// Ejecutar solo si este archivo es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
}

module.exports = { syncExistingTags }
