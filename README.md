# Zulip Emoji Feed

This simple Astro project generates an RSS feed for new custom emojis added to a Zulip instance. It fetches the emoji data from the Zulip server via API request, processes and caches the response, and creates an RSS feed from the response data for users to subscribe to.

The goal is to allow members of the organization and moderators to stay updated on new emoji additions without the need to check the Zulip emoji list manually. And also it's kind of fun to see the new emojis. :)

**Disclaimer:** This project makes (questionable) use of the experimental Astro [Content Layer API](https://astro.build/blog/astro-4140/#experimental-content-layer-api).

More documentation coming soon:tm: Also this isn't deployed anywhere at the moment.
