import { defineCollection, z } from 'astro:content'

import fetchData from '../scripts/fetchData'

const emojiCollection = defineCollection({
  loader: fetchData,
  schema: z.object({
    id: z.string(),
    name: z.string(),
    source_url: z.string().url(),
    still_url: z.string().url().nullable(),
    deactivated: z.boolean(),
    author_id: z.number(),
  }),
})

export const collections = {
  emoji: emojiCollection,
}
