import type { Feed, Article } from "@/db/schema"

const API_BASE = "/api"

export interface FeedWithStats extends Feed {
  articleCount: number
  unreadCount: number
}

export interface ArticleWithFeed extends Article {
  feedTitle: string
  feedCategory: string
}

// Feeds
export async function getFeeds(): Promise<FeedWithStats[]> {
  const res = await fetch(`${API_BASE}/feeds`)
  if (!res.ok) throw new Error("Failed to fetch feeds")
  return res.json()
}

export async function addFeed(url: string, category?: string): Promise<Feed> {
  const res = await fetch(`${API_BASE}/feeds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, category }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to add feed")
  }
  return res.json()
}

export async function deleteFeed(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/feeds/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete feed")
}

export async function updateFeed(
  id: number,
  data: { title?: string; category?: string }
): Promise<Feed> {
  const res = await fetch(`${API_BASE}/feeds/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update feed")
  return res.json()
}

export async function fetchFeedArticles(
  id: number
): Promise<{ success: boolean; addedCount: number }> {
  const res = await fetch(`${API_BASE}/feeds/${id}/fetch`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to fetch articles")
  return res.json()
}

export async function fetchAllArticles(): Promise<{
  success: boolean
  addedCount: number
}> {
  const res = await fetch(`${API_BASE}/feeds/fetch-all`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to fetch articles")
  return res.json()
}

// Articles
export interface GetArticlesParams {
  feedId?: number
  category?: string
  search?: string
  unreadOnly?: boolean
  limit?: number
  offset?: number
}

export async function getArticles(
  params: GetArticlesParams = {}
): Promise<ArticleWithFeed[]> {
  const searchParams = new URLSearchParams()
  if (params.feedId) searchParams.set("feedId", String(params.feedId))
  if (params.category) searchParams.set("category", params.category)
  if (params.search) searchParams.set("search", params.search)
  if (params.unreadOnly) searchParams.set("unreadOnly", "true")
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.offset) searchParams.set("offset", String(params.offset))

  const res = await fetch(`${API_BASE}/articles?${searchParams}`)
  if (!res.ok) throw new Error("Failed to fetch articles")
  return res.json()
}

export async function toggleArticleRead(
  id: number,
  isRead: boolean
): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/${id}/read`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isRead }),
  })
  if (!res.ok) throw new Error("Failed to update article")
  return res.json()
}

export async function markAllRead(params?: {
  feedId?: number
  category?: string
}): Promise<void> {
  const searchParams = new URLSearchParams()
  if (params?.feedId) searchParams.set("feedId", String(params.feedId))
  if (params?.category) searchParams.set("category", params.category)

  const res = await fetch(`${API_BASE}/articles/mark-all-read?${searchParams}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Failed to mark all read")
}

// Categories
export async function getCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/categories`)
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}
