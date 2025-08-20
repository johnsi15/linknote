#!/usr/bin/env tsx

/**
 * Script para generar embeddings de todos los tags existentes
 * y almacenarlos en Upstash Vector
 * 
 * Uso: npx tsx scripts/sync-existing-tags.ts
 */

import { db } from '@/db/index'
import { tags } from '@/db/schema'
import { batchProcessTags } from '@/lib/upstash-vector'

async function syncExistingTags() {
  console.log('🏷️  Iniciando sincronización de tags existentes...')
  
  try {
    // Obtener todos los tags de la base de datos
    console.log('📊 Obteniendo tags de la base de datos...')
    const existingTags = await db.select().from(tags)
    
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

// Verificar variables de entorno necesarias
function checkEnvironmentVariables() {
  const requiredVars = [
    'UPSTASH_VECTOR_REST_URL',
    'UPSTASH_VECTOR_REST_TOKEN',
    'OPENAI_API_KEY'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Faltan las siguientes variables de entorno:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    process.exit(1)
  }
}

// Ejecutar el script
async function main() {
  console.log('🚀 Script de sincronización de tags iniciado')
  
  checkEnvironmentVariables()
  await syncExistingTags()
  
  console.log('✨ Script completado exitosamente')
  process.exit(0)
}

// Ejecutar solo si este archivo es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
}

export { syncExistingTags }
