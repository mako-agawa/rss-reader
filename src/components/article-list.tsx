"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, CheckCheck, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArticleCard } from "./article-card"
import {
  getArticles,
  toggleArticleRead,
  markAllRead,
  type ArticleWithFeed,
  type GetArticlesParams,
} from "@/lib/api"

interface ArticleListProps {
  feedId?: number
  category?: string
  onArticleChange?: () => void
}

export function ArticleList({ feedId, category, onArticleChange }: ArticleListProps) {
  const [articles, setArticles] = useState<ArticleWithFeed[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)

  const fetchArticles = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: GetArticlesParams = { limit: 100 }
      if (feedId) params.feedId = feedId
      if (category) params.category = category
      if (search) params.search = search
      if (unreadOnly) params.unreadOnly = true

      const data = await getArticles(params)
      setArticles(data)
    } finally {
      setIsLoading(false)
    }
  }, [feedId, category, search, unreadOnly])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleToggleRead = async (id: number, isRead: boolean) => {
    await toggleArticleRead(id, isRead)
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead } : a))
    )
    onArticleChange?.()
  }

  const handleMarkAllRead = async () => {
    await markAllRead({ feedId, category })
    setArticles((prev) => prev.map((a) => ({ ...a, isRead: true })))
    onArticleChange?.()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchArticles()
  }

  const unreadCount = articles.filter((a) => !a.isRead).length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="記事を検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            検索
          </Button>
        </form>
        <Button
          variant={unreadOnly ? "default" : "outline"}
          onClick={() => setUnreadOnly(!unreadOnly)}
        >
          <Filter className="h-4 w-4 mr-2" />
          未読のみ
        </Button>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            すべて既読
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>記事がありません</p>
            <p className="text-sm mt-1">フィードを登録して記事を取得してください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onToggleRead={handleToggleRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
