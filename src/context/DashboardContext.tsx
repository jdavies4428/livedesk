import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { DashboardState, DashboardAction } from '../types';
import { LAYOUT_LIST } from '../types';

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
  const [state, dispatch] = useReducer(dashboardReducer, DEFAULT_STATE);

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
