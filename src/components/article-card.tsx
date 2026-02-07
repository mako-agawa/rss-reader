"use client"

import { ExternalLink, Check, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ArticleWithFeed } from "@/lib/api"

interface ArticleCardProps {
  article: ArticleWithFeed
  onToggleRead: (id: number, isRead: boolean) => void
}

export function ArticleCard({ article, onToggleRead }: ArticleCardProps) {
  const pubDate = article.pubDate
    ? new Date(article.pubDate).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  return (
    <Card className={cn("transition-colors", article.isRead && "opacity-60")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="shrink-0">
                {article.feedCategory}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                {article.feedTitle}
              </span>
            </div>
            <CardTitle className="text-base leading-tight">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                onClick={() => !article.isRead && onToggleRead(article.id, true)}
              >
                {article.title}
              </a>
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleRead(article.id, !article.isRead)}
              title={article.isRead ? "未読にする" : "既読にする"}
            >
              {article.isRead ? (
                <Check className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Circle className="h-4 w-4 text-primary" />
              )}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => !article.isRead && onToggleRead(article.id, true)}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      {article.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {article.description}
          </p>
          {pubDate && (
            <p className="text-xs text-muted-foreground mt-2">{pubDate}</p>
          )}
        </CardContent>
      )}
      {!article.description && pubDate && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{pubDate}</p>
        </CardContent>
      )}
    </Card>
  )
}
