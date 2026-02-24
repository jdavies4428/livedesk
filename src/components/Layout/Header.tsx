import { useState, useEffect, type ReactNode } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import type { LayoutMode } from '../../types';
import { LAYOUT_LIST } from '../../types';
import styles from './Header.module.css';

// SVG grid icons — each draws a mini layout diagram
const g = 1; // gap between rects
const S = 18; // viewBox size

function LayoutIcon({ rects }: { rects: Array<[number, number, number, number]> }) {
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width="16" height="16" fill="currentColor">
      {rects.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="1.5" />
      ))}
    </svg>
  );
}

const hw = (S - g) / 2;     // half width
const tw = (S - 2 * g) / 3; // third width
const hh = (S - g) / 2;     // half height
const th = (S - 2 * g) / 3; // third height

const LAYOUT_ICONS: Record<LayoutMode, ReactNode> = {
  'focus-1': <LayoutIcon rects={[[0, 0, S, S]]} />,
  'split-2': <LayoutIcon rects={[
    [0, 0, hw, S],
    [hw + g, 0, hw, S],
  ]} />,
  'grid-4': <LayoutIcon rects={[
    [0, 0, hw, hh],
    [hw + g, 0, hw, hh],
    [0, hh + g, hw, hh],
    [hw + g, hh + g, hw, hh],
  ]} />,
  'grid-6': <LayoutIcon rects={[
    [0, 0, hw, th],
    [hw + g, 0, hw, th],
    [0, th + g, hw, th],
    [hw + g, th + g, hw, th],
    [0, 2 * (th + g), hw, th],
    [hw + g, 2 * (th + g), hw, th],
  ]} />,
  'grid-9': <LayoutIcon rects={[
    [0, 0, tw, th],
    [tw + g, 0, tw, th],
    [2 * (tw + g), 0, tw, th],
    [0, th + g, tw, th],
    [tw + g, th + g, tw, th],
    [2 * (tw + g), th + g, tw, th],
    [0, 2 * (th + g), tw, th],
    [tw + g, 2 * (th + g), tw, th],
    [2 * (tw + g), 2 * (th + g), tw, th],
  ]} />,
  'focus-pip': <LayoutIcon rects={[
    [0, 0, S - tw - g, S],
    [S - tw, 0, tw, th],
    [S - tw, th + g, tw, th],
    [S - tw, 2 * (th + g), tw, th],
  ]} />,
  'focus-bar': <LayoutIcon rects={[
    [0, 0, S, S - th - g],
    [0, S - th, tw, th],
    [tw + g, S - th, tw, th],
    [2 * (tw + g), S - th, tw, th],
  ]} />,
};

const LAYOUT_LABELS: Record<LayoutMode, string> = {
  'focus-1': 'Focus (1)',
  'split-2': 'Split (2)',
  'grid-4': 'Grid 2×2',
  'grid-6': 'Grid 2×3',
  'grid-9': 'Grid 3×3',
  'focus-pip': 'Focus + PiP',
  'focus-bar': 'Focus + Bar',
};

function useUtcClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const monthNames = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
      ];
      const day = dayNames[now.getUTCDay()];
      const date = now.getUTCDate().toString().padStart(2, '0');
      const month = monthNames[now.getUTCMonth()];
      const year = now.getUTCFullYear();
      const h = now.getUTCHours().toString().padStart(2, '0');
      const m = now.getUTCMinutes().toString().padStart(2, '0');
      const s = now.getUTCSeconds().toString().padStart(2, '0');
      setTime(`${day} ${date} ${month} ${year}  ${h}:${m}:${s} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Header() {
  const { state, dispatch } = useDashboard();
  const clock = useUtcClock();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.logo}>
          <span className={styles.logoLive}>LIVE</span>
          <span className={styles.logoDesk}>DESK</span>
        </h1>

        <div className={styles.layoutSwitcher}>
          {LAYOUT_LIST.map((mode) => (
            <button
              key={mode}
              className={`${styles.layoutBtn} ${state.layout === mode ? styles.layoutBtnActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LAYOUT', payload: mode })}
              title={LAYOUT_LABELS[mode]}
            >
              {LAYOUT_ICONS[mode]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.clock}>{clock}</span>
      </div>
    </header>
  );
}
