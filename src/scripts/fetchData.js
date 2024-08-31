import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

async function fetchData() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'emoji.json')

  let cachedData = []
  try {
    const cacheContents = await fs.readFile(filePath, 'utf-8')
    cachedData = JSON.parse(cacheContents)
  } catch (error) {
    // File doesn't exist or is invalid, start with empty object
  }

  try {
    const stats = await fs.stat(filePath)
    const fileAge = Date.now() - stats.mtime.getTime()

    if (fileAge < 3600000) {
      // 1 hour in milliseconds
      console.log('Cached emoji data is less than 1 hour old. Skipping fetch.')
      return cachedData
    }
  } catch (error) {
    // File doesn't exist, proceed with fetching
  }

  if (
    !process.env.ZULIP_API_URL ||
    !process.env.ZULIP_API_KEY ||
    !process.env.ZULIP_EMAIL
  ) {
    throw Error(
      'Missing ZULIP_API_URL, ZULIP_API_KEY, or ZULIP_EMAIL. Check .env file and try again.',
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

  responseData = Array.from(Object.values(responseData))

  // WARNING: This assumes that the emoji will always be returned in sequence
  // (which seems to be the case, right now)
  const newEmojiCount = responseData.length - cachedData.length
  if (newEmojiCount === 0) {
    console.log('No change, returning cached data')
    return cachedData
  }
  // Concatenate new emoji to the existing data
  const updatedData = cachedData.concat(responseData.slice(-newEmojiCount))

  await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2))
  console.log(
    `fetchData: Emoji data fetched, updated, and cached. Added ${newEmojiCount} new emoji`,
  )

  return updatedData
}

export default fetchData
