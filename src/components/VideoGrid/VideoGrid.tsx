import { useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { CHANNELS } from '../../data/channels';
import { LAYOUT_DEFAULTS } from '../../types';
import VideoCell from './VideoCell';
import styles from './VideoGrid.module.css';

export default function VideoGrid() {
  const { state } = useDashboard();

  const visibleChannels = useMemo(() => {
    if (state.focusedChannelId) {
      const ch = CHANNELS.find((c) => c.id === state.focusedChannelId);
      return ch ? [ch] : [];
    }

    const maxSlots = LAYOUT_DEFAULTS[state.layout];
    return state.activeChannelIds
      .map((id) => CHANNELS.find((c) => c.id === id))
      .filter(Boolean)
      .slice(0, maxSlots) as typeof CHANNELS;
  }, [state.activeChannelIds, state.focusedChannelId, state.layout]);

  const layoutAttr = state.focusedChannelId ? 'focus-1' : state.layout;

  return (
    <div className={styles.grid} data-layout={layoutAttr}>
      {visibleChannels.map((channel) => (
        <VideoCell key={channel.id} channel={channel} />
      ))}
    </div>
  );
}
