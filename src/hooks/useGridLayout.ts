import { useDashboard } from '../context/DashboardContext';
import type { LayoutMode } from '../types';

export function useGridLayout() {
  const { state, dispatch, cycleLayout } = useDashboard();

  const setLayout = (layout: LayoutMode) => {
    dispatch({ type: 'SET_LAYOUT', payload: layout });
  };

  return {
    layout: state.layout,
    setLayout,
    cycleLayout,
  };
}
