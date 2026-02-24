import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { channelHandle } = req.query as { channelHandle: string };
  if (!channelHandle) return res.status(400).json({ error: 'missing channelHandle' });

  // Cache for 4 minutes
  res.setHeader('Cache-Control', 's-maxage=240, stale-while-revalidate=60');

  try {
    const url = `https://www.youtube.com/${channelHandle}/live`;
    const html = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LiveDesk/1.0)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }).then((r) => r.text());

    // Extract video ID from canonical URL or og:url meta tag
    const canonicalMatch = html.match(
      /"canonicalBaseUrl":"\/watch\?v=([a-zA-Z0-9_-]{11})"/
    );
    const ogMatch = html.match(
      /meta property="og:url" content="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/
    );
    const videoId = canonicalMatch?.[1] ?? ogMatch?.[1];

    if (videoId) {
      return res.status(200).json({ videoId, source: 'scraped' });
    }

    // Check if it's actually live
    const playerMatch = html.match(/"isLiveContent":true/);
    if (!playerMatch) {
      return res.status(200).json({ videoId: null, reason: 'no_live_stream' });
    }

    return res.status(200).json({ videoId: null, reason: 'extraction_failed' });
  } catch {
    return res.status(500).json({ error: 'scrape_failed' });
  }
}
