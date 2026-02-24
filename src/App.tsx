import { DashboardProvider } from './context/DashboardContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import VideoGrid from './components/VideoGrid/VideoGrid';
import StatusBar from './components/StatusBar/StatusBar';
import styles from './App.module.css';

function AppInner() {
  useKeyboardShortcuts();

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
