import Parser from "rss-parser"

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "RSS Reader/1.0",
  },
})

export interface ParsedArticle {
  title: string
  link: string
  description?: string
  pubDate?: Date
}

export interface ParsedFeed {
  title: string
  articles: ParsedArticle[]
}

export async function parseFeed(url: string): Promise<ParsedFeed> {
  const feed = await parser.parseURL(url)

  return {
    title: feed.title || "Untitled Feed",
    articles: (feed.items || []).map((item) => ({
      title: item.title || "Untitled",
      link: item.link || "",
      description: item.contentSnippet || item.content || undefined,
      pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
    })),
  }
}
