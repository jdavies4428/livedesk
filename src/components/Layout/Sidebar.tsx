import { useState, useMemo, useRef, useCallback } from 'react';
import { CHANNELS } from '../../data/channels';
import type { Channel } from '../../data/channels';
import { useDashboard } from '../../context/DashboardContext';
import { LAYOUT_DEFAULTS } from '../../types';
import ChannelCard from '../ChannelCard/ChannelCard';
import styles from './Sidebar.module.css';

const REGIONS = [
  { label: 'ALL', filter: null },
  { label: 'GLOBAL', filter: 'Global' },
  { label: 'US', filter: 'USA' },
  { label: 'UK/EU', filter: 'UK' },
  { label: 'APAC', filter: 'Asia-Pacific' },
  { label: 'MENA', filter: 'Middle East' },
] as const;

export default function Sidebar() {
  const { state, dispatch } = useDashboard();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Touch drag-and-drop state
  const touchDragIndex = useRef<number | null>(null);
  const touchCurrentOver = useRef<number | null>(null);
  const touchStartY = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  const getCardElements = useCallback(() => {
    if (!listRef.current) return [];
    return Array.from(listRef.current.querySelectorAll('[data-drag-index]')) as HTMLElement[];
  }, []);

  const handleTouchStart = (index: number) => (e: React.TouchEvent) => {
    touchDragIndex.current = index;
    touchStartY.current = e.touches[0].clientY;
    setDragIndex(index);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchDragIndex.current === null) return;
    e.preventDefault();
    const touch = e.touches[0];
    const cards = getCardElements();
    let overIndex: number | null = null;
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        overIndex = Number(card.dataset.dragIndex);
        break;
      }
    }
    if (overIndex !== null && overIndex !== touchCurrentOver.current) {
      touchCurrentOver.current = overIndex;
      setDragOverIndex(overIndex);
    }
  }, [getCardElements]);

  const handleTouchEnd = useCallback(() => {
    const from = touchDragIndex.current;
    const to = touchCurrentOver.current;
    if (from !== null && to !== null && from !== to) {
      const newOrder = [...state.activeChannelIds];
      const [moved] = newOrder.splice(from, 1);
      newOrder.splice(to, 0, moved);
      dispatch({ type: 'REORDER_CHANNELS', payload: newOrder });
    }
    touchDragIndex.current = null;
    touchCurrentOver.current = null;
    setDragIndex(null);
    setDragOverIndex(null);
  }, [state.activeChannelIds, dispatch]);

  const filteredChannels = useMemo(() => {
    return CHANNELS.filter((ch) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !ch.name.toLowerCase().includes(q) &&
          !ch.shortName.toLowerCase().includes(q) &&
          !ch.region.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (regionFilter) {
        if (!ch.region.includes(regionFilter)) return false;
      }
      return true;
    });
  }, [search, regionFilter]);

  const { activeFiltered, inactiveFiltered } = useMemo(() => {
    const activeSet = new Set(state.activeChannelIds);
    const active = state.activeChannelIds
      .map((id) => filteredChannels.find((ch) => ch.id === id))
      .filter(Boolean) as Channel[];
    const inactive = filteredChannels.filter((ch) => !activeSet.has(ch.id));
    return { activeFiltered: active, inactiveFiltered: inactive };
  }, [state.activeChannelIds, filteredChannels]);

  const maxSlots = LAYOUT_DEFAULTS[state.layout];

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', state.activeChannelIds[index]);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (targetIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...state.activeChannelIds];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(targetIndex, 0, moved);
    dispatch({ type: 'REORDER_CHANNELS', payload: newOrder });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  if (!state.isSidebarOpen) return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        {state.activeChannelIds.length} / {CHANNELS.length} LIVE
      </div>

      <input
        className={styles.search}
        type="text"
        placeholder="Filter channels…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={styles.pills}>
        {REGIONS.map((r) => (
          <button
            key={r.label}
            className={`${styles.pill} ${regionFilter === r.filter ? styles.pillActive : ''}`}
            onClick={() => setRegionFilter(r.filter)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className={`${styles.list} scrollable`} ref={listRef}>
        {activeFiltered.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              SHOWING {Math.min(activeFiltered.length, maxSlots)} / {state.activeChannelIds.length} ACTIVE
            </div>
            <div className={styles.hint}>Drag to reorder priority</div>
            {activeFiltered.map((ch) => {
              const globalIndex = state.activeChannelIds.indexOf(ch.id);
              const isVisible = globalIndex < maxSlots;
              return (
                <div
                  key={ch.id}
                  data-drag-index={globalIndex}
                  draggable
                  onDragStart={handleDragStart(globalIndex)}
                  onDragOver={handleDragOver(globalIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop(globalIndex)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={handleTouchStart(globalIndex)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`${styles.draggableCard} ${
                    dragIndex === globalIndex ? styles.dragging : ''
                  } ${
                    dragOverIndex === globalIndex ? styles.dragOver : ''
                  } ${
                    !isVisible ? styles.hiddenChannel : ''
                  }`}
                >
                  <span className={styles.dragHandle}>⠿</span>
                  <span className={styles.slotNumber}>{globalIndex + 1}</span>
                  <ChannelCard channel={ch} />
                </div>
              );
            })}
          </>
        )}

        {inactiveFiltered.length > 0 && (
          <>
            <div className={styles.sectionHeader}>AVAILABLE</div>
            {inactiveFiltered.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
