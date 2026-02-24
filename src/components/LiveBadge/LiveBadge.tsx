import styles from './LiveBadge.module.css';

interface LiveBadgeProps {
  small?: boolean;
}

export default function LiveBadge({ small }: LiveBadgeProps) {
  return (
    <span className={`${styles.badge} ${small ? styles.small : ''}`}>
      <span className={styles.dot} />
      LIVE
    </span>
  );
}
