"use client"

import { useState } from "react"
import { Trash2, RefreshCw, Edit2, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FeedWithStats,
  deleteFeed,
  updateFeed,
  fetchFeedArticles,
} from "@/lib/api"
import { cn } from "@/lib/utils"

interface FeedListProps {
  feeds: FeedWithStats[]
  isLoading: boolean
  onRefresh: () => void
}

export function FeedList({ feeds, isLoading, onRefresh }: FeedListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [fetchingId, setFetchingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("このフィードを削除しますか？関連する記事もすべて削除されます。")) {
      return
    }
    await deleteFeed(id)
    onRefresh()
  }

  const handleEdit = (feed: FeedWithStats) => {
    setEditingId(feed.id)
    setEditTitle(feed.title)
    setEditCategory(feed.category)
  }

  const handleSave = async (id: number) => {
    await updateFeed(id, { title: editTitle, category: editCategory })
    setEditingId(null)
    onRefresh()
  }

  const handleFetch = async (id: number) => {
    setFetchingId(id)
    try {
      await fetchFeedArticles(id)
      onRefresh()
    } finally {
      setFetchingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (feeds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>フィードがまだ登録されていません</p>
        <p className="text-sm mt-1">「フィードを追加」ボタンから登録してください</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feeds.map((feed) => (
        <Card key={feed.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              {editingId === feed.id ? (
                <div className="flex-1 space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="タイトル"
                  />
                  <Input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="カテゴリ"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <CardTitle className="text-lg">{feed.title}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {feed.url}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-1 ml-4">
                {editingId === feed.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSave(feed.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFetch(feed.id)}
                      disabled={fetchingId === feed.id}
                    >
                      <RefreshCw
                        className={cn(
                          "h-4 w-4",
                          fetchingId === feed.id && "animate-spin"
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(feed)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(feed.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{feed.category}</Badge>
              <span className="text-sm text-muted-foreground">
                {feed.articleCount} 件の記事 / {feed.unreadCount} 件未読
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
