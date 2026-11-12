const express = require("express");

const router = express.Router();
const CACHE_TTL_MS = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
let cachedNews = null;
let cacheExpiresAt = 0;
let pendingRefresh = null;

const decodeXml = (value = "") => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .trim();

const readTag = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
};

const readThumbnail = (item) => {
  const mediaMatch = item.match(/<(?:media:thumbnail|media:content|enclosure)\b[^>]*\burl=["']([^"']+)["']/i);
  const description = readTag(item, "description");
  const imageMatch = description.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  const thumbnail = decodeXml(mediaMatch?.[1] || imageMatch?.[1] || "");
  try {
    const parsed = new URL(thumbnail);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
};

const makeFeedUrl = (query) => {
  const params = new URLSearchParams({ q: query, hl: "en-IN", gl: "IN", ceid: "IN:en" });
  return `https://news.google.com/rss/search?${params.toString()}`;
};

const fetchFeed = async (query, category) => {
  const response = await fetch(makeFeedUrl(query), {
    headers: { "User-Agent": "LawyerFactoryNews/1.0 (+https://lawyerfactory.in)" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`News feed returned ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(([, item]) => {
    const title = readTag(item, "title");
    const link = readTag(item, "link");
    const publishedAt = readTag(item, "pubDate");
    const source = readTag(item, "source");
    if (!title || !link || !/^https?:\/\//i.test(link)) return null;
    return {
      id: link,
      title,
      url: link,
      source: source || "Google News",
      category,
      thumbnail: readThumbnail(item),
      published_at: Number.isNaN(Date.parse(publishedAt)) ? null : new Date(publishedAt).toISOString(),
    };
  }).filter(Boolean);
};

const loadNews = async () => {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const threeYearsAgo = new Date(now);
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const date = (value) => value.toISOString().slice(0, 10);

  const [clat, judiciary, courts, archive] = await Promise.all([
    fetchFeed('(CLAT OR law entrance) India news', "CLAT and legal education"),
    fetchFeed('(Indian judiciary OR legal news OR law) India', "Law and judiciary"),
    fetchFeed('(Supreme Court OR High Court) India legal news', "Court updates"),
    fetchFeed(`(Indian law OR Supreme Court OR judiciary) after:${date(threeYearsAgo)} before:${date(oneYearAgo)}`, "Past legal news"),
  ]);

  const unique = (items) => [...new Map(items
    .filter((item) => item.published_at)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .map((item) => [item.url, item])).values()];
  const currentCutoff = oneYearAgo.getTime();
  const archiveCutoff = threeYearsAgo.getTime();
  const allCurrent = unique([...clat, ...judiciary, ...courts]).filter((item) => new Date(item.published_at).getTime() >= currentCutoff);
  const allArchive = unique(archive).filter((item) => {
    const timestamp = new Date(item.published_at).getTime();
    return timestamp >= archiveCutoff && timestamp < currentCutoff;
  });

  return {
    current: allCurrent.slice(0, 18),
    archive: allArchive.slice(0, 18),
    updated_at: new Date().toISOString(),
    refresh_interval_minutes: CACHE_TTL_MS / 60000,
  };
};

router.get("/", async (_req, res) => {
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
  if (cachedNews && Date.now() < cacheExpiresAt) return res.json({ success: true, ...cachedNews });

  if (!pendingRefresh) {
    pendingRefresh = loadNews()
      .then((news) => {
        cachedNews = news;
        cacheExpiresAt = Date.now() + CACHE_TTL_MS;
        return news;
      })
      .finally(() => { pendingRefresh = null; });
  }

  try {
    return res.json({ success: true, ...(await pendingRefresh) });
  } catch (error) {
    if (cachedNews) return res.json({ success: true, ...cachedNews, stale: true });
    console.error("Unable to load current legal news:", error.message);
    return res.status(503).json({ success: false, message: "Legal news is temporarily unavailable." });
  }
});

module.exports = router;
