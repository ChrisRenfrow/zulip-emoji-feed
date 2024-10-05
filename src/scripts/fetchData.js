import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

let kv
if (process.env.VERCEL) {
  kv = (await import('@vercel/kv')).kv
}

async function getCachedData() {
  let cachedData = []
  let lastFetchTime = 0

  if (process.env.VERCEL) {
    cachedData = (await kv.get('emojiCache')) || []
    lastFetchTime = (await kv.get('lastFetchTime')) || 0
  } else {
    const filePath = path.join(process.cwd(), 'src', 'data', 'emoji.json')
    try {
      const cacheContents = await fs.readFile(filePath, 'utf-8')
      cachedData = JSON.parse(cacheContents)
      const stats = await fs.stat(filePath)
      lastFetchTime = stats.mtime.getTime()
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
    }
  }

  return { cachedData, lastFetchTime }
}

async function fetchZulipEmoji() {
  if (
    !process.env.ZULIP_API_URL ||
    !process.env.ZULIP_API_KEY ||
    !process.env.ZULIP_EMAIL
  ) {
    throw Error(
      'Missing ZULIP_API_URL, ZULIP_API_KEY, or ZULIP_EMAIL. Check environment variables and try again.',
    )
  }

  const response = await fetch(
    `${process.env.ZULIP_API_URL}/api/v1/realm/emoji`,
    {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            `${process.env.ZULIP_EMAIL}:${process.env.ZULIP_API_KEY}`,
          ).toString('base64'),
      },
    },
  )

  if (!response.ok) {
    throw Error(
      `Error fetching emoji data: ${response.status} ${response.statusText}`,
    )
  }

  let responseData = (await response.json()).emoji
  return Array.from(Object.values(responseData))
}

async function updateCache(updatedData, currentTime) {
  if (process.env.VERCEL) {
    await kv.set('emojiCache', updatedData)
    await kv.set('lastFetchTime', currentTime)
  } else {
    const filePath = path.join(process.cwd(), 'src', 'data', 'emoji.json')
    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2))
  }
}

async function fetchData() {
  const { cachedData, lastFetchTime } = await getCachedData()
  const currentTime = Date.now()
  const oneHour = 3600000 // 1 hour in milliseconds

  if (cachedData.length > 0 && currentTime - lastFetchTime < oneHour) {
    console.log('Cached emoji data is less than 1 hour old. Skipping fetch.')
    return cachedData
  }

  const responseData = await fetchZulipEmoji()
  const newEmojiCount = responseData.length - cachedData.length

  if (newEmojiCount === 0) {
    console.log('No change, returning cached data')
    return cachedData
  }

  const updatedData = cachedData.concat(responseData.slice(-newEmojiCount))

  await updateCache(updatedData, currentTime)

  console.log(
    `fetchData: Emoji data fetched, updated, and cached. Added ${newEmojiCount} new emoji`,
  )

  return updatedData
}

export default fetchData
