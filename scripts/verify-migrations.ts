import 'dotenv/config'
import { db } from '../src/db'

async function verifyMigrations() {
  try {
    // Intenta consultar cada tabla para verificar que existen
    const linksResult = await db.query.links.findMany({
      limit: 1,
    })

    const tagsResult = await db.query.tags.findMany({
      limit: 1,
    })

    const linkTagsResult = await db.query.linkTags.findMany({
      limit: 1,
    })

    console.log('✅ Verificación de tablas completada:')
    console.log('- Tabla "links" existe')
    console.log('- Tabla "tags" existe')
    console.log('- Tabla "link_tags" existe')

    // En lugar de intentar mostrar toda la estructura, muestra información más específica
    console.log('\nInformación de las tablas:')
    console.log('- Links: ', linksResult.length > 0 ? `${linksResult.length} registros encontrados` : 'Tabla vacía')
    console.log('- Tags: ', tagsResult.length > 0 ? `${tagsResult.length} registros encontrados` : 'Tabla vacía')
    console.log(
      '- LinkTags: ',
      linkTagsResult.length > 0 ? `${linkTagsResult.length} registros encontrados` : 'Tabla vacía'
    )

    return true
  } catch (error) {
    console.error('❌ Error al verificar las migraciones:', error)
    return false
  }
}

// Ejecutar la verificación
verifyMigrations().then(success => {
  if (success) {
    console.log('\n✅ Las migraciones se han aplicado correctamente')
  } else {
    console.log('\n❌ Hay problemas con las migraciones')
  }
  process.exit(success ? 0 : 1)
})
