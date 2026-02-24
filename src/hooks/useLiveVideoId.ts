import { useState, useEffect } from 'react';
import type { Channel } from '../data/channels';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useLiveVideoId(channel: Channel): string {
  const [videoId, setVideoId] = useState(channel.fallbackVideoId);

  useEffect(() => {
    const fetchId = async () => {
      try {
        const res = await fetch(
          `/api/youtube-live?channelHandle=${encodeURIComponent(channel.ytChannelHandle)}`
        );
        const data = await res.json();
        if (data.videoId) setVideoId(data.videoId);
      } catch {
        // silently use fallback — stream continues uninterrupted
      }
    };

    fetchId();
    const interval = setInterval(fetchId, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [channel.ytChannelHandle]);

  return videoId;
}
