"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedForm } from "@/components/feed-form"
import { FeedList } from "@/components/feed-list"
import { getFeeds, getCategories, FeedWithStats } from "@/lib/api"

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<FeedWithStats[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [feedsData, categoriesData] = await Promise.all([
        getFeeds(),
        getCategories(),
      ])
      setFeeds(feedsData)
      setCategories(categoriesData)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">フィード管理</h1>
        </div>
        <FeedForm categories={categories} onSuccess={fetchData} />
      </div>

      <FeedList feeds={feeds} isLoading={isLoading} onRefresh={fetchData} />
    </div>
  )
}
