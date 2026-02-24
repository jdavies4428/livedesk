import { useState, useCallback, type CSSProperties, type MouseEvent } from 'react';
import type { Channel } from '../../data/channels';
import { useDashboard } from '../../context/DashboardContext';
import { useLiveVideoId } from '../../hooks/useLiveVideoId';
import YouTubePlayer from '../Player/YouTubePlayer';
import LiveBadge from '../LiveBadge/LiveBadge';
import styles from './VideoCell.module.css';

interface VideoCellProps {
  channel: Channel;
}

type CellState = 'loading' | 'live' | 'error' | 'buffering';

export default function VideoCell({ channel }: VideoCellProps) {
  const { state, dispatch } = useDashboard();
  const videoId = useLiveVideoId(channel);
  const [cellState, setCellState] = useState<CellState>('loading');
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const isMuted = state.globalMuted
    ? state.unmuteChannelId !== channel.id
    : false;

  const handleReady = useCallback(() => {
    setCellState('live');
  }, []);

  const handleError = useCallback((code: number) => {
    setErrorCode(code);
    setCellState('error');
  }, []);

  const handleStateChange = useCallback((ytState: number) => {
    // YT.PlayerState: BUFFERING=3, PLAYING=1, ENDED=0
    if (ytState === 3) setCellState('buffering');
    else if (ytState === 1) setCellState('live');
  }, []);

  const handleDoubleClick = () => {
    const isFocused = state.focusedChannelId === channel.id;
    dispatch({ type: 'SET_FOCUS', payload: isFocused ? null : channel.id });
  };

  const handleUnmute = (e: MouseEvent) => {
    e.stopPropagation();
    if (state.unmuteChannelId === channel.id) {
      dispatch({ type: 'UNMUTE_CHANNEL', payload: null });
    } else {
      dispatch({ type: 'UNMUTE_CHANNEL', payload: channel.id });
    }
  };

  const handleFullscreen = (e: MouseEvent) => {
    e.stopPropagation();
    const el = (e.target as HTMLElement).closest(`.${styles.cell}`);
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen();
      }
    }
  };

  const isEmbedBlocked = errorCode === 101 || errorCode === 150;

  return (
    <div
      className={`${styles.cell} ${state.focusedChannelId === channel.id ? styles.focused : ''}`}
      style={{ '--accent': channel.accentColor } as CSSProperties}
      onDoubleClick={handleDoubleClick}
    >
      {/* Player */}
      {videoId && cellState !== 'error' && (
        <YouTubePlayer
          videoId={videoId}
          channelId={channel.id}
          muted={isMuted}
          onReady={handleReady}
          onError={handleError}
          onStateChange={handleStateChange}
        />
      )}

      {/* Loading overlay */}
      {cellState === 'loading' && (
        <div className={styles.overlay}>
          <span className={styles.channelLabel}>
            {channel.flag} {channel.shortName}
          </span>
          <div className={styles.loadingContent}>
            <div className={styles.spinner} />
            <span className={styles.loadingText}>Connecting…</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {cellState === 'error' && (
        <div className={styles.overlay}>
          <span className={styles.channelLabel}>
            {channel.flag} {channel.shortName}
          </span>
          <div className={styles.errorContent}>
            <span className={styles.errorIcon}>
              {isEmbedBlocked ? '⚠' : '✕'}
            </span>
            <span className={styles.errorText}>
              {isEmbedBlocked ? 'Embed blocked' : 'Unavailable'}
            </span>
            <a
              className={styles.youtubeLink}
              href={`https://www.youtube.com/${channel.ytChannelHandle}/live`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Open on YouTube ↗
            </a>
          </div>
        </div>
      )}

      {/* Hover overlay — channel info on hover */}
      {cellState === 'live' && (
        <div className={styles.hoverOverlay}>
          <div className={styles.topBar}>
            <span className={styles.channelTag}>
              {channel.flag} {channel.shortName}
            </span>
            <LiveBadge />
          </div>
          <div className={styles.bottomBar}>
            <span className={styles.timestamp}>
              {new Date().toLocaleTimeString('en-GB', {
                timeZone: 'UTC',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              UTC
            </span>
          </div>
        </div>
      )}

      {/* Always-visible controls — bottom right */}
      {cellState === 'live' && (
        <div className={styles.controls}>
          <button
            className={styles.controlBtn}
            onClick={handleFullscreen}
            title="Fullscreen"
          >
            ⛶
          </button>
          <button
            className={`${styles.controlBtn} ${!isMuted ? styles.active : ''}`}
            onClick={handleUnmute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      )}

      {/* Buffering indicator */}
      {cellState === 'buffering' && (
        <div className={styles.bufferingDot} />
      )}
    </div>
  );
}
