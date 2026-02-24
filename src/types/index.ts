export type LayoutMode =
  | 'focus-1'
  | 'split-2'
  | 'grid-4'
  | 'grid-6'
  | 'grid-9'
  | 'focus-pip'
  | 'focus-bar';

export const LAYOUT_DEFAULTS: Record<LayoutMode, number> = {
  'focus-1': 1,
  'split-2': 2,
  'grid-4': 4,
  'grid-6': 6,
  'grid-9': 9,
  'focus-pip': 4,
  'focus-bar': 4,
};

export const LAYOUT_LIST: LayoutMode[] = [
  'focus-1',
  'split-2',
  'grid-4',
  'grid-6',
  'grid-9',
  'focus-pip',
  'focus-bar',
];

export interface DashboardState {
  layout: LayoutMode;
  activeChannelIds: string[];
  focusedChannelId: string | null;
  isSidebarOpen: boolean;
  globalMuted: boolean;
  unmuteChannelId: string | null;
}

export type DashboardAction =
  | { type: 'SET_LAYOUT'; payload: LayoutMode }
  | { type: 'TOGGLE_CHANNEL'; payload: string }
  | { type: 'REORDER_CHANNELS'; payload: string[] }
  | { type: 'SET_FOCUS'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_GLOBAL_MUTED'; payload: boolean }
  | { type: 'UNMUTE_CHANNEL'; payload: string | null }
  | { type: 'RESET_TO_DEFAULT' };
