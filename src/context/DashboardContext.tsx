import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import type { DashboardState, DashboardAction, LayoutMode } from '../types';
import { LAYOUT_LIST } from '../types';

const STORAGE_KEY = 'livedesk-prefs';

const DEFAULT_STATE: DashboardState = {
  layout: 'grid-9',
  activeChannelIds: [
    'bloomberg', 'sky-news', 'todo-noticias', 'al-jazeera',
    'dw-news', 'france24', 'euronews',
    'abc-news-us', 'cbs-news', 'nbc-news',
  ],
  focusedChannelId: null,
  isSidebarOpen: true,
  globalMuted: true,
  unmuteChannelId: null,
};

function loadSavedState(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw) as { activeChannelIds?: string[]; layout?: LayoutMode };
    return {
      ...DEFAULT_STATE,
      activeChannelIds: Array.isArray(saved.activeChannelIds) ? saved.activeChannelIds : DEFAULT_STATE.activeChannelIds,
      layout: LAYOUT_LIST.includes(saved.layout as LayoutMode) ? saved.layout as LayoutMode : DEFAULT_STATE.layout,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: DashboardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      activeChannelIds: state.activeChannelIds,
      layout: state.layout,
    }));
  } catch {
    // Storage full or unavailable
  }
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LAYOUT':
      return {
        ...state,
        layout: action.payload,
        focusedChannelId: null,
        unmuteChannelId: action.payload === 'focus-1' ? state.activeChannelIds[0] ?? null : state.unmuteChannelId,
      };

    case 'TOGGLE_CHANNEL': {
      const id = action.payload;
      const isActive = state.activeChannelIds.includes(id);
      const activeChannelIds = isActive
        ? state.activeChannelIds.filter((cid) => cid !== id)
        : [...state.activeChannelIds, id];
      return { ...state, activeChannelIds };
    }

    case 'REORDER_CHANNELS':
      return { ...state, activeChannelIds: action.payload };

    case 'SET_FOCUS':
      return {
        ...state,
        focusedChannelId: action.payload,
        unmuteChannelId: action.payload ?? state.unmuteChannelId,
      };

    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };

    case 'SET_GLOBAL_MUTED':
      return {
        ...state,
        globalMuted: action.payload,
        unmuteChannelId: action.payload ? null : state.unmuteChannelId,
      };

    case 'UNMUTE_CHANNEL':
      return { ...state, unmuteChannelId: action.payload };

    case 'RESET_TO_DEFAULT':
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
      return DEFAULT_STATE;

    default:
      return state;
  }
}

interface DashboardContextValue {
  state: DashboardState;
  dispatch: Dispatch<DashboardAction>;
  cycleLayout: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, undefined, loadSavedState);

  useEffect(() => {
    saveState(state);
  }, [state.activeChannelIds, state.layout]);

  const cycleLayout = () => {
    const currentIndex = LAYOUT_LIST.indexOf(state.layout);
    const nextIndex = (currentIndex + 1) % LAYOUT_LIST.length;
    dispatch({ type: 'SET_LAYOUT', payload: LAYOUT_LIST[nextIndex] });
  };

  return (
    <DashboardContext.Provider value={{ state, dispatch, cycleLayout }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
