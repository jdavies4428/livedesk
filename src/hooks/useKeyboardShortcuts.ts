import { useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';

export function useKeyboardShortcuts() {
  const { state, dispatch, cycleLayout } = useDashboard();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case 'g':
          cycleLayout();
          break;
        case 's':
          dispatch({ type: 'TOGGLE_SIDEBAR' });
          break;
        case 'm':
          dispatch({ type: 'SET_GLOBAL_MUTED', payload: !state.globalMuted });
          break;
        case 'f':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        case 'escape':
          dispatch({ type: 'SET_FOCUS', payload: null });
          break;
        default: {
          // Number keys 1-9 for focusing channels
          const num = parseInt(e.key);
          if (num >= 1 && num <= 9) {
            const channelId = state.activeChannelIds[num - 1];
            if (channelId) {
              const isFocused = state.focusedChannelId === channelId;
              dispatch({
                type: 'SET_FOCUS',
                payload: isFocused ? null : channelId,
              });
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [state.globalMuted, state.activeChannelIds, state.focusedChannelId, dispatch, cycleLayout]);
}
