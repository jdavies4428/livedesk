import type { Channel } from '../../data/channels';
import { useDashboard } from '../../context/DashboardContext';
import LiveBadge from '../LiveBadge/LiveBadge';
import styles from './ChannelCard.module.css';

interface ChannelCardProps {
  channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const { state, dispatch } = useDashboard();
  const isActive = state.activeChannelIds.includes(channel.id);

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_CHANNEL', payload: channel.id });
  };

  return (
    <button
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={handleToggle}
      title={channel.name}
    >
      <div
        className={styles.accentBar}
        style={{ backgroundColor: channel.accentColor }}
      />
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>
            {channel.flag} {channel.shortName}
          </span>
          {isActive && <LiveBadge small />}
        </div>
        <span className={styles.region}>{channel.region}</span>
      </div>
    </button>
  );
}
