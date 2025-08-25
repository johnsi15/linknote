import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

export const links = sqliteTable('links', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const linkTags = sqliteTable(
  'link_tags',
  {
    linkId: text('link_id')
      .notNull()
      .references(() => links.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  table => [primaryKey({ columns: [table.linkId, table.tagId] })]
)

export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
export type LinkTag = typeof linkTags.$inferSelect
export type NewLinkTag = typeof linkTags.$inferInsert
