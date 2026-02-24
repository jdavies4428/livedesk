import { useDashboard } from '../../context/DashboardContext';
import styles from './StatusBar.module.css';

export default function StatusBar() {
  const { state } = useDashboard();

  return (
    <footer className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.activeDot} />
        {state.activeChannelIds.length} FEEDS ACTIVE
      </div>
      <div className={styles.center}>
        <kbd>1-9</kbd> focus feed &nbsp;
        <kbd>G</kbd> toggle grid &nbsp;
        <kbd>S</kbd> sidebar &nbsp;
        <kbd>M</kbd> mute all &nbsp;
        <kbd>F</kbd> fullscreen
      </div>
      <div className={styles.right}>
        LIVEDESK v1.0 · ALL STREAMS CONTINUOUS · NO IDLE TIMEOUT
      </div>
    </footer>
  );
}
