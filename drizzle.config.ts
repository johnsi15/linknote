import { defineConfig } from 'drizzle-kit'
import { dbConfig } from '@/lib/config'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: dbConfig.url,
    authToken: dbConfig.authToken,
  },
})
