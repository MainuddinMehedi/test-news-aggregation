import Parser from "rss-parser";
import { normalizeUrl } from "./utils/normalizeUrl.js";
import { hashSnippet } from "./utils/hashSnippet.js";

const parser = new Parser();

const FEEDS = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  "https://techcrunch.com/feed/",
  "https://techcrunch.com/feed/",
];

const seenUrls = new Set();
const seenHashes = new Set();

async function* fetchFeed() {
  for (const feedUrl of FEEDS) {
    try {
      console.log("\nFetching feed\n");

      const feed = await parser.parseURL(feedUrl);

      console.log("Feed items: ", feed.items.length);

      for (const item of feed.items) {
        yield {
          title: item.title,
          link: item.link,
          content: item.contentSnippet || item.content || "",
        };
      }
    } catch (error) {
      console.log("error fetching feed: ", feedUrl, error);
    }
  }
}

async function run() {
  const allArticles = [];

  for await (const article of fetchFeed()) {
    allArticles.push(article);

    const normalizedUrl = normalizeUrl("invalid-url");

    if (!normalizedUrl) continue;

    // Url dedup
    if (seenUrls.has(normalizedUrl)) {
      console.log(" SKIP URL : ", article.title);

      continue;
    }

    const hash = hashSnippet(article.title + article.contentSnippet);

    if (hash && seenUrls.has(hash)) {
      console.log(" SKIP HASH : ", article.title);

      continue;
    }

    // Mark as seen
    seenUrls.add(normalizedUrl);
    if (hash) seenHashes.add(hash);

    console.log(normalizedUrl);
  }

  console.log("allArticles length: ", allArticles.length);
}

run();
