"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Rss, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FeedWithStats, fetchAllArticles } from "@/lib/api"
import { useState } from "react"

interface SidebarProps {
  feeds: FeedWithStats[]
  categories: string[]
  selectedFeedId?: number
  selectedCategory?: string
  onRefresh: () => void
}

export function Sidebar({
  feeds,
  categories,
  selectedFeedId,
  selectedCategory,
  onRefresh,
}: SidebarProps) {
  const pathname = usePathname()
  const [isFetching, setIsFetching] = useState(false)

  const handleFetchAll = async () => {
    setIsFetching(true)
    try {
      await fetchAllArticles()
      onRefresh()
    } finally {
      setIsFetching(false)
    }
  }

  const totalUnread = feeds.reduce((sum, f) => sum + f.unreadCount, 0)

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Rss className="h-5 w-5" />
          <span>RSS Reader</span>
        </Link>
      </div>

      <div className="p-4">
        <Button
          onClick={handleFetchAll}
          disabled={isFetching}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
          {isFetching ? "取得中..." : "全記事を取得"}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          <Link href="/">
            <Button
              variant={pathname === "/" && !selectedFeedId && !selectedCategory ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Home className="h-4 w-4 mr-2" />
              すべての記事
              {totalUnread > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {totalUnread}
                </Badge>
              )}
            </Button>
          </Link>

          {categories.length > 0 && (
            <div className="pt-4">
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                カテゴリ
              </h3>
              {categories.map((category) => {
                const categoryUnread = feeds
                  .filter((f) => f.category === category)
                  .reduce((sum, f) => sum + f.unreadCount, 0)

                return (
                  <Link key={category} href={`/?category=${encodeURIComponent(category)}`}>
                    <Button
                      variant={selectedCategory === category ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      {category}
                      {categoryUnread > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {categoryUnread}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>
          )}

          {feeds.length > 0 && (
            <div className="pt-4">
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                フィード
              </h3>
              {feeds.map((feed) => (
                <Link key={feed.id} href={`/?feedId=${feed.id}`}>
                  <Button
                    variant={selectedFeedId === feed.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <span className="truncate">{feed.title}</span>
                    {feed.unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-auto shrink-0">
                        {feed.unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Link href="/feeds">
          <Button variant="outline" className="w-full">
            フィード管理
          </Button>
        </Link>
      </div>
    </div>
  )
}
