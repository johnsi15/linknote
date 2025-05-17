import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import { dbConfig } from '@/lib/config'

const turso = createClient({
  url: dbConfig.url,
  authToken: dbConfig.authToken,
})

export const db = drizzle(turso, { schema })
