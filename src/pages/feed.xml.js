import rss from "@astrojs/rss";

import { getCollection } from "astro:content";

const orgName = "Recurse Center";
const updateInterval = "24h";
const maxItems = 50;

export async function GET(context) {
  const emojis = await getCollection('emojis');

  const sortedEmojis = Object.values(emojis)
    .sort((a, b) => parseInt(b.data.id) - parseInt(a.data.id))
    .filter(emoji => !emoji.data.deactivated)
    .slice(0, maxItems);

  return rss({
    title: `${orgName} Zulip Custom Emoji Feed`,
    description: `Discover new custom emojis! Updated every ${updateInterval}.`,
    site: context.site,
    items: Array.from(sortedEmojis).map((emoji) => ({
      title: emoji.data.name,
      description: `New emoji: ${emoji.data.name}`,
      link: emoji.data.source_url,
      pubDate: new Date(emoji.data.first_seen),
      customData: `<source_url>${emoji.data.source_url}</source_url>`
        .concat(emoji.data.still_url !== null ? `<still_url>${emoji.data.still_url}</still_url>` : ''),
    })),
    customData: `<language>en-us</language>`,
  });
}
