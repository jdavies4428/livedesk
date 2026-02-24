import { useEffect } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { useDashboard } from './context/DashboardContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import VideoGrid from './components/VideoGrid/VideoGrid';
import StatusBar from './components/StatusBar/StatusBar';
import styles from './App.module.css';

function AppInner() {
  useKeyboardShortcuts();
  const { state, dispatch } = useDashboard();

  // Close sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth <= 768 && state.isSidebarOpen) {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.content}>
          <VideoGrid />
        </main>
      </div>
      <StatusBar />
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <AppInner />
    </DashboardProvider>
  );
}
