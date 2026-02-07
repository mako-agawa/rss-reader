import { Hono } from "hono"
import { handle } from "hono/vercel"
import { db } from "@/db"
import { feeds, articles } from "@/db/schema"
import { eq, desc, like, and, sql } from "drizzle-orm"
import { parseFeed } from "@/lib/rss-parser"

const app = new Hono().basePath("/api")

// フィード一覧取得
app.get("/feeds", async (c) => {
  const allFeeds = await db
    .select({
      id: feeds.id,
      title: feeds.title,
      url: feeds.url,
      category: feeds.category,
      createdAt: feeds.createdAt,
      updatedAt: feeds.updatedAt,
      articleCount: sql<number>`(SELECT COUNT(*) FROM articles WHERE articles.feed_id = feeds.id)`,
      unreadCount: sql<number>`(SELECT COUNT(*) FROM articles WHERE articles.feed_id = feeds.id AND articles.is_read = 0)`,
    })
    .from(feeds)
    .orderBy(desc(feeds.createdAt))

  return c.json(allFeeds)
})

// フィード登録
app.post("/feeds", async (c) => {
  const body = await c.req.json<{ url: string; category?: string }>()

  if (!body.url) {
    return c.json({ error: "URL is required" }, 400)
  }

  try {
    // RSSフィードをパースしてタイトルを取得
    const parsed = await parseFeed(body.url)

    const [newFeed] = await db
      .insert(feeds)
      .values({
        title: parsed.title,
        url: body.url,
        category: body.category || "未分類",
      })
      .returning()

    return c.json(newFeed, 201)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return c.json({ error: "このフィードは既に登録されています" }, 409)
    }
    return c.json({ error: "フィードの取得に失敗しました" }, 500)
  }
})

// フィード削除
app.delete("/feeds/:id", async (c) => {
  const id = parseInt(c.req.param("id"))

  await db.delete(feeds).where(eq(feeds.id, id))

  return c.json({ success: true })
})

// フィード更新
app.patch("/feeds/:id", async (c) => {
  const id = parseInt(c.req.param("id"))
  const body = await c.req.json<{ title?: string; category?: string }>()

  const [updated] = await db
    .update(feeds)
    .set({
      ...(body.title && { title: body.title }),
      ...(body.category && { category: body.category }),
      updatedAt: new Date(),
    })
    .where(eq(feeds.id, id))
    .returning()

  return c.json(updated)
})

// 個別フィードの記事取得
app.post("/feeds/:id/fetch", async (c) => {
  const id = parseInt(c.req.param("id"))

  const [feed] = await db.select().from(feeds).where(eq(feeds.id, id))

  if (!feed) {
    return c.json({ error: "Feed not found" }, 404)
  }

  try {
    const parsed = await parseFeed(feed.url)
    let addedCount = 0

    for (const article of parsed.articles) {
      if (!article.link) continue

      try {
        await db.insert(articles).values({
          feedId: id,
          title: article.title,
          link: article.link,
          description: article.description,
          pubDate: article.pubDate,
        })
        addedCount++
      } catch {
        // リンクが重複している場合はスキップ
      }
    }

    // 更新日時を更新
    await db
      .update(feeds)
      .set({ updatedAt: new Date() })
      .where(eq(feeds.id, id))

    return c.json({ success: true, addedCount })
  } catch {
    return c.json({ error: "記事の取得に失敗しました" }, 500)
  }
})

// 全フィードの記事取得
app.post("/feeds/fetch-all", async (c) => {
  const allFeeds = await db.select().from(feeds)
  let totalAdded = 0

  for (const feed of allFeeds) {
    try {
      const parsed = await parseFeed(feed.url)

      for (const article of parsed.articles) {
        if (!article.link) continue

        try {
          await db.insert(articles).values({
            feedId: feed.id,
            title: article.title,
            link: article.link,
            description: article.description,
            pubDate: article.pubDate,
          })
          totalAdded++
        } catch {
          // 重複はスキップ
        }
      }

      await db
        .update(feeds)
        .set({ updatedAt: new Date() })
        .where(eq(feeds.id, feed.id))
    } catch {
      // 失敗したフィードはスキップ
    }
  }

  return c.json({ success: true, addedCount: totalAdded })
})

// 記事一覧取得
app.get("/articles", async (c) => {
  const feedId = c.req.query("feedId")
  const category = c.req.query("category")
  const search = c.req.query("search")
  const unreadOnly = c.req.query("unreadOnly") === "true"
  const limit = parseInt(c.req.query("limit") || "50")
  const offset = parseInt(c.req.query("offset") || "0")

  const conditions = []

  if (feedId) {
    conditions.push(eq(articles.feedId, parseInt(feedId)))
  }

  if (unreadOnly) {
    conditions.push(eq(articles.isRead, false))
  }

  if (search) {
    conditions.push(like(articles.title, `%${search}%`))
  }

  let query = db
    .select({
      id: articles.id,
      feedId: articles.feedId,
      title: articles.title,
      link: articles.link,
      description: articles.description,
      pubDate: articles.pubDate,
      isRead: articles.isRead,
      createdAt: articles.createdAt,
      feedTitle: feeds.title,
      feedCategory: feeds.category,
    })
    .from(articles)
    .innerJoin(feeds, eq(articles.feedId, feeds.id))
    .orderBy(desc(articles.pubDate), desc(articles.createdAt))
    .limit(limit)
    .offset(offset)

  if (category) {
    conditions.push(eq(feeds.category, category))
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query
  }

  const result = await query

  return c.json(result)
})

// 既読/未読切り替え
app.patch("/articles/:id/read", async (c) => {
  const id = parseInt(c.req.param("id"))
  const body = await c.req.json<{ isRead: boolean }>()

  const [updated] = await db
    .update(articles)
    .set({ isRead: body.isRead })
    .where(eq(articles.id, id))
    .returning()

  return c.json(updated)
})

// 全記事を既読に
app.post("/articles/mark-all-read", async (c) => {
  const feedId = c.req.query("feedId")
  const category = c.req.query("category")

  if (feedId) {
    await db
      .update(articles)
      .set({ isRead: true })
      .where(eq(articles.feedId, parseInt(feedId)))
  } else if (category) {
    const feedsInCategory = await db
      .select({ id: feeds.id })
      .from(feeds)
      .where(eq(feeds.category, category))

    for (const feed of feedsInCategory) {
      await db
        .update(articles)
        .set({ isRead: true })
        .where(eq(articles.feedId, feed.id))
    }
  } else {
    await db.update(articles).set({ isRead: true })
  }

  return c.json({ success: true })
})

// カテゴリ一覧取得
app.get("/categories", async (c) => {
  const result = await db
    .selectDistinct({ category: feeds.category })
    .from(feeds)
    .orderBy(feeds.category)

  return c.json(result.map((r) => r.category))
})

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
