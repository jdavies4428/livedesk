import { useEffect, useRef, useCallback } from 'react';
import styles from './YouTubePlayer.module.css';

interface YouTubePlayerProps {
  videoId: string;
  channelId: string;
  muted?: boolean;
  onReady?: () => void;
  onError?: (code: number) => void;
  onStateChange?: (state: number) => void;
}

export default function YouTubePlayer({
  videoId,
  channelId,
  muted = true,
  onReady,
  onError,
  onStateChange,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const videoIdRef = useRef(videoId);

  const createPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT?.Player) return;

    // Create a unique div for the player inside the container
    const playerDiv = document.createElement('div');
    playerDiv.id = `yt-player-${channelId}`;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(playerDiv);

    // Use type assertion: 'host' and 'widget_referrer' are valid YT params
    // but not in @types/youtube
    playerRef.current = new YT.Player(playerDiv.id, {
      host: 'https://www.youtube-nocookie.com',
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
        widget_referrer: window.location.origin,
      } as YT.PlayerVars,
      events: {
        onReady: (event) => {
          // Ensure iframe allows fullscreen
          const iframe = event.target.getIframe();
          if (iframe) {
            iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media');
            iframe.setAttribute('allowFullScreen', '');
          }
          if (muted) {
            event.target.mute();
          }
          onReady?.();
        },
        onError: (event) => {
          onError?.(event.data);
        },
        onStateChange: (event) => {
          onStateChange?.(event.data);
        },
      },
    } as YT.PlayerOptions);
  }, [channelId]); // Only recreate if channelId changes

  // Initialize player when YT API is ready
  useEffect(() => {
    if (window.YT?.Player) {
      createPlayer();
    } else {
      // Wait for YT API to load
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        createPlayer();
      };
    }

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [createPlayer]);

  // Update video when videoId changes (don't recreate player)
  useEffect(() => {
    if (videoId && videoId !== videoIdRef.current && playerRef.current) {
      try {
        playerRef.current.loadVideoById(videoId);
      } catch {
        // Player may not be ready yet
      }
    }
    videoIdRef.current = videoId;
  }, [videoId]);

  // Handle mute/unmute
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (muted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(80);
      }
    } catch {
      // Player may not be ready
    }
  }, [muted]);

  // Resume playback when tab becomes visible again (mobile browsers pause iframes)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && playerRef.current) {
        try {
          const state = playerRef.current.getPlayerState();
          // YT.PlayerState: PAUSED=2, CUED=5, ENDED=0
          if (state === 2 || state === 5 || state === 0) {
            playerRef.current.playVideo();
          }
        } catch {
          // Player may not be ready
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return <div ref={containerRef} className={styles.container} />;
}
