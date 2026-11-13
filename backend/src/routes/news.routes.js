const express = require("express");
const crypto = require("crypto");

const router = express.Router();
const CACHE_TTL_MS = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const FALLBACK_THUMBNAIL = "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202305/sc_clear_with_1bird-sixteen_nine.jpg?VersionId=IVPCmYoTLq6B.E_JCWaZKBbrcOYnjJaS";
let cachedNews = null;
let cacheExpiresAt = 0;
let pendingRefresh = null;
const uploadedThumbnails = new Map();
const articleThumbnailCache = new Map();

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

const getApplicationDeadline = (description) => {
  const plainText = description.replace(/<[^>]*>/g, " ").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
  const datePattern = "(\\d{1,2}(?:st|nd|rd|th)?[\\s/-]+[A-Za-z]{3,9}[,\\s/-]+20\\d{2}|[A-Za-z]{3,9}[\\s/-]+\\d{1,2}(?:st|nd|rd|th)?[,]?\\s+20\\d{2}|\\d{1,2}[/-]\\d{1,2}[/-]20\\d{2})";
  const match = plainText.match(new RegExp(`(?:last date(?: to apply)?|application deadline|apply by|closing date|applications? close(?: on)?)\\s*[:\\-]?\\s*${datePattern}`, "i"));
  return match?.[1] || null;
};

const readAttribute = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1] || "";

const fetchArticleThumbnail = async (articleUrl) => {
  if (articleThumbnailCache.has(articleUrl)) return articleThumbnailCache.get(articleUrl);
  try {
    const response = await fetch(articleUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LawyerFactoryNews/1.0)", Accept: "text/html" },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
    const html = (await response.text()).slice(0, 1_500_000);
    const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => tag);
    const imageTag = metaTags.find((tag) => /^(og:image|twitter:image)$/i.test(readAttribute(tag, "property") || readAttribute(tag, "name")));
    const imageValue = decodeXml(readAttribute(imageTag || "", "content"));
    const imageUrl = imageValue ? new URL(imageValue, response.url).href : null;
    if (imageUrl && ["https:", "http:"].includes(new URL(imageUrl).protocol)) {
      articleThumbnailCache.set(articleUrl, imageUrl);
      if (articleThumbnailCache.size > 300) articleThumbnailCache.delete(articleThumbnailCache.keys().next().value);
      return imageUrl;
    }
  } catch {
    // Some publishers block preview requests. The original feed image or fallback is used.
  }
  return null;
};

const uploadThumbnailToCloudinary = async (sourceUrl) => {
  const cloudName = process.env.CLOUD_NAME;
  const apiKey = process.env.CLOUD_API_KEY;
  const apiSecret = process.env.CLOUD_API_SECRET;
  if (!cloudName || cloudName === "Root" || !apiKey || !apiSecret) return sourceUrl;
  if (uploadedThumbnails.has(sourceUrl)) return uploadedThumbnails.get(sourceUrl);

  const publicId = `lawyer_factory/news/${crypto.createHash("sha256").update(sourceUrl).digest("hex")}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  const form = new FormData();
  form.append("file", sourceUrl);
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("overwrite", "true");
  form.append("api_key", apiKey);
  form.append("signature", signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(15000),
    });
    const payload = await response.json();
    if (!response.ok || !payload.secure_url) throw new Error(payload.error?.message || `Upload returned ${response.status}`);
    uploadedThumbnails.set(sourceUrl, payload.secure_url);
    if (uploadedThumbnails.size > 300) uploadedThumbnails.delete(uploadedThumbnails.keys().next().value);
    return payload.secure_url;
  } catch (error) {
    console.warn("Cloudinary news thumbnail upload failed:", error.message);
    return sourceUrl;
  }
};

const storeThumbnails = async (items) => Promise.all(items.map(async (item) => {
  const sourceThumbnail = item.thumbnail || await fetchArticleThumbnail(item.url) || FALLBACK_THUMBNAIL;
  return {
    ...item,
    thumbnail: await uploadThumbnailToCloudinary(sourceThumbnail),
    thumbnail_is_fallback: !item.thumbnail && !articleThumbnailCache.has(item.url),
  };
}));

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
    const description = readTag(item, "description");
    if (!title || !link || !/^https?:\/\//i.test(link)) return null;
    return {
      id: link,
      title,
      url: link,
      source: source || "Google News",
      category,
      thumbnail: readThumbnail(item),
      application_deadline: getApplicationDeadline(description),
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

  const vacancyQuery = `(judiciary recruitment OR High Court vacancy OR law officer vacancy OR court recruitment) India ${now.getFullYear()}`;
  const [clat, judiciary, courts, archive, vacancyFeed] = await Promise.all([
    fetchFeed('(CLAT OR law entrance) India news', "CLAT and legal education"),
    fetchFeed('(Indian judiciary OR legal news OR law) India', "Law and judiciary"),
    fetchFeed('(Supreme Court OR High Court) India legal news', "Court updates"),
    fetchFeed(`(Indian law OR Supreme Court OR judiciary) after:${date(threeYearsAgo)} before:${date(oneYearAgo)}`, "Past legal news"),
    fetchFeed(vacancyQuery, "Government vacancies"),
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

  const vacancies = unique(vacancyFeed).slice(0, 3);
  const [currentNews, pastNews, vacancyNews] = await Promise.all([
    storeThumbnails(allCurrent.slice(0, 3)),
    storeThumbnails(allArchive.slice(0, 3)),
    storeThumbnails(vacancies),
  ]);

  return {
    current: currentNews,
    archive: pastNews,
    vacancies: vacancyNews,
    updated_at: new Date().toISOString(),
    refresh_interval_minutes: CACHE_TTL_MS / 60000,
    thumbnail_storage: process.env.CLOUD_NAME && process.env.CLOUD_NAME !== "Root" && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET ? "cloudinary" : "source",
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
