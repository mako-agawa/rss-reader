"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ArticleList } from "@/components/article-list"
import { getFeeds, getCategories, FeedWithStats } from "@/lib/api"

function HomeContent() {
  const searchParams = useSearchParams()
  const feedIdParam = searchParams.get("feedId")
  const categoryParam = searchParams.get("category")

  const feedId = feedIdParam ? parseInt(feedIdParam) : undefined
  const category = categoryParam || undefined

  const [feeds, setFeeds] = useState<FeedWithStats[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = useCallback(async () => {
    const [feedsData, categoriesData] = await Promise.all([
      getFeeds(),
      getCategories(),
    ])
    setFeeds(feedsData)
    setCategories(categoriesData)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshKey])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        feeds={feeds}
        categories={categories}
        selectedFeedId={feedId}
        selectedCategory={category}
        onRefresh={handleRefresh}
      />
      <main className="flex-1 overflow-hidden">
        <ArticleList
          key={`${feedId}-${category}-${refreshKey}`}
          feedId={feedId}
          category={category}
          onArticleChange={handleRefresh}
        />
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
