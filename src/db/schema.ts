import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const feeds = sqliteTable("feeds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  category: text("category").notNull().default("未分類"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  feedId: integer("feed_id")
    .notNull()
    .references(() => feeds.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  link: text("link").notNull().unique(),
  description: text("description"),
  pubDate: integer("pub_date", { mode: "timestamp" }),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type Feed = typeof feeds.$inferSelect
export type NewFeed = typeof feeds.$inferInsert
export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
