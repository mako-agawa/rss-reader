"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { addFeed } from "@/lib/api"

interface FeedFormProps {
  categories: string[]
  onSuccess: () => void
}

export function FeedForm({ categories, onSuccess }: FeedFormProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await addFeed(url, category || undefined)
      setUrl("")
      setCategory("")
      setOpen(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "フィードの登録に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          フィードを追加
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>RSSフィードを追加</DialogTitle>
          <DialogDescription>
            RSSフィードのURLを入力してください
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">RSS URL</label>
            <Input
              placeholder="https://example.com/feed.xml"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">カテゴリ</label>
            <Input
              placeholder="例: テック, ニュース"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="categories"
            />
            <datalist id="categories">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "登録中..." : "登録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
