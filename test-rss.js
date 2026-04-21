import Parser from "rss-parser";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeUrl } from "./utils/normalizeUrl.js";
import { hashSnippet } from "./utils/hashSnippet.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser();

const FEEDS = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  "https://techcrunch.com/feed/",
];

const seenUrls = new Set();
const seenHashes = new Set();

async function* fetchFeed() {
  let feedCount = 0;
  let allItems = [];

  for (const feedUrl of FEEDS) {
    try {
      feedCount++;
      console.log(`\n📡 Fetching (${feedCount}/${FEEDS.length}): ${feedUrl}`);

      const feed = await parser.parseURL(feedUrl);

      console.log(
        `✅ Success! Found ${feed.items.length} items from ${feed.title}`,
      );

      // Adding source details in the news object.
      const itemsWithSource = feed.items.map((item) => ({
        ...item,
        sourceTitle: feed.title,
        sourceUrl: feedUrl,
        fetchedAt: new Date().toISOString(),
      }));

      allItems = allItems.concat(itemsWithSource);

      for (const item of itemsWithSource) {
        yield {
          title: item.title,
          link: item.link,
          contentSnippet: item.contentSnippet || item.content || "",
          ...item,
        };
      }
    } catch (err) {
      console.log(`Error fetching feed: ${err}`);
      console.log(`Feed error: ${feedUrl} ${err.message}`);
    }
  }

  // Save to news.json
  const outputPath = path.join(__dirname, "news.json");
  await fs.writeFile(outputPath, JSON.stringify(allItems, null, 2));

  console.log(`\n✅ Saved ${allItems.length} items to news.json.`);
}

async function run() {
  for await (const article of fetchFeed()) {
    const normalizedUrl = normalizeUrl(article.link);

    if (!normalizedUrl) continue;

    // URL dedup
    if (seenUrls.has(normalizedUrl)) {
      console.log("⏭️ [SKIP URL]", article.title);

      continue;
    }

    // Hash dedup
    const hash = hashSnippet(article.title + article.contentSnippet);

    if (hash && seenHashes.has(hash)) {
      console.log("⏭️ [SKIP HASH]", article.title);
      continue;
    }

    // Mark as seen
    seenUrls.add(normalizedUrl);
    if (hash) seenHashes.add(hash);

    // Output
    console.log("[NEW]", article.title);
    console.log("🔗", normalizedUrl);
  }
}

run();
