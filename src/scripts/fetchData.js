import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function fetchData() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'emojis.json');


  let existingData = {};
  try {
    const existingContent = await fs.readFile(filePath, 'utf-8');
    existingData = JSON.parse(existingContent);
  } catch (error) {
    // File doesn't exist or is invalid, start with empty object
  }

  try {
    const stats = await fs.stat(filePath);
    const fileAge = Date.now() - stats.mtime.getTime();

    if (fileAge < 3600000) { // 1 hour in milliseconds
      console.log('Cached emoji data is less than 1 hour old. Skipping fetch.');
      return existingData;
    }
  } catch (error) {
    // File doesn't exist, proceed with fetching
  }

  if (!process.env.ZULIP_API_URL || !process.env.ZULIP_API_KEY || !process.env.ZULIP_EMAIL) {
    throw Error("Missing ZULIP_API_URL, ZULIP_API_KEY, or ZULIP_EMAIL. Check .env file and try again.");
  }

  const response = await fetch(`${process.env.ZULIP_API_URL}/api/v1/realm/emoji`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${process.env.ZULIP_EMAIL}:${process.env.ZULIP_API_KEY}`).toString('base64')
    }
  });

  if (!response.ok) {
    throw Error(`Error fetching emoji data: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()).emoji;

  // Update existing data with any new emojis, adding a first_seen attribute
  const currentDate = new Date().toISOString();
  const updatedData = Object.values(data).map((acc, emoji) => ({
    ...emoji,
    first_seen: existingData[emoji.id]?.first_seen || currentDate,
  }));

  await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
  console.log('Emoji data fetched, cached, and updated with first seen dates.');

  return updatedData;
}

export default fetchData;
