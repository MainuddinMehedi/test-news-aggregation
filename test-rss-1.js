import Parser from "rss-parser";

const parser = new Parser();

const FEEDS = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  "https://techcrunch.com/feed/",
];

async function fetchFeed() {
  for (const feedUrl of FEEDS) {
    try {
      console.log("\nFetching feed\n");
      // console.log(`\n📡 Fetching (${feedCount}/${FEEDS.length}): ${feedUrl}`);

      const feed = await parser.parseURL(feedUrl);

      console.log("Feed items: ", feed.items.length);
    } catch (error) {
      console.log("error fetching feed: ", error);
    }
  }
}

fetchFeed();
