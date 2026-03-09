// src/app/api/news/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RSS_SOURCES = [
  "https://www.autosport.com/rss/f1/news/",
  "https://www.motorsport.com/rss/f1/news/",
  "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
];

async function fetchRSS(url) {
  const res = await fetch(url, { next: { revalidate: 1800 } });
  const xml = await res.text();

  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
      return m ? m[1].trim() : "";
    };
    const imgM = block.match(/url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i)
      || block.match(/<media:content[^>]+url="([^"]+)"/i)
      || block.match(/<enclosure[^>]+url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);

    const title = get("title");
    const link  = get("link") || block.match(/<link>([^<]+)<\/link>/)?.[1] || "";
    const desc  = get("description").replace(/<[^>]+>/g, "").slice(0, 150);
    const pub   = get("pubDate");
    const img   = imgM ? imgM[1] : null;
    const src   = url.includes("autosport") ? "Autosport" : url.includes("motorsport") ? "Motorsport.com" : "BBC Sport";

    if (title && link) items.push({ title, link, desc, pub, img, source: src });
  }
  return items;
}

async function fetchNewsAPI() {
  const key = process.env.NEWS_API_KEY;
  if (!key) return [];
  const url = `https://newsapi.org/v2/everything?q=formula+1+OR+f1+grand+prix&language=en&sortBy=publishedAt&pageSize=20&apiKey=${key}`;
  const res  = await fetch(url, { next: { revalidate: 1800 } });
  const data = await res.json();
  if (!data.articles) return [];
  return data.articles.map(a => ({
    title:  a.title,
    link:   a.url,
    desc:   a.description?.slice(0, 150) || "",
    pub:    a.publishedAt,
    img:    a.urlToImage,
    source: a.source?.name || "NewsAPI",
  }));
}

function dedupe(articles) {
  const seen = new Set();
  return articles.filter(a => {
    const key = a.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET() {
  try {
    // Coba NewsAPI dulu, parallel dengan RSS
    const [newsApiItems, ...rssResults] = await Promise.allSettled([
      fetchNewsAPI(),
      ...RSS_SOURCES.map(url => fetchRSS(url)),
    ]);

    const fromNewsAPI = newsApiItems.status === "fulfilled" ? newsApiItems.value : [];
    const fromRSS     = rssResults.flatMap(r => r.status === "fulfilled" ? r.value : []);

    // NewsAPI utama, RSS sebagai tambahan/fallback
    const all = fromNewsAPI.length > 0
      ? [...fromNewsAPI, ...fromRSS]
      : fromRSS;

    // Sort by date terbaru
    const sorted = dedupe(all).sort((a, b) => {
      const da = a.pub ? new Date(a.pub) : 0;
      const db = b.pub ? new Date(b.pub) : 0;
      return db - da;
    }).slice(0, 30);

    return NextResponse.json({ success: true, data: sorted, count: sorted.length });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message, data: [] });
  }
}