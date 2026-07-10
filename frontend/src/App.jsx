import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AskAgent from './pages/AskAgent';
import UploadPDF from './pages/UploadPDF';
import KnowledgeBase from './pages/KnowledgeBase';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <main
            className="main-area"
            style={{
              marginLeft: collapsed ? 'var(--sidebar-collapsed)' : undefined,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ask" element={<AskAgent />} />
              <Route path="/upload" element={<UploadPDF />} />
              <Route path="/knowledge" element={<KnowledgeBase />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
