import { NextResponse } from "next/server";

const DEFAULT_CHANNEL_ID = "UCi6cSd-UxmjTVnBnjGK8fQw";

function parseFeedItems(xml: string) {
  const entryRegex = /<entry\b[^>]*>[\s\S]*?<\/entry>/g;
  const entries = Array.from(xml.matchAll(entryRegex));

  return entries
    .map((entry) => entry[0])
    .map((entry) => {
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/i);
      const idMatch = entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/i);
      const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/i);
      const thumbnailMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/i);

      const title = titleMatch?.[1]?.replace(/<[^>]+>/g, "").trim() || "Без названия";
      const id = idMatch?.[1]?.trim();
      const published_at = publishedMatch?.[1]?.trim() || new Date().toISOString();
      const thumbnail = thumbnailMatch?.[1]?.trim();

      return {
        id,
        title,
        thumbnail,
        published_at,
      };
    })
    .filter((item) => Boolean(item.id));
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID;
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ items: [] }, { status: response.status });
    }

    const xml = await response.text();
    const items = parseFeedItems(xml).slice(0, 4);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Ошибка загрузки YouTube RSS:", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
