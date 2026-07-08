import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  FileUp,
  Database,
  Sun,
  Moon,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ask', label: 'Ask Agent', icon: MessageSquareText },
  { to: '/upload', label: 'Upload PDF', icon: FileUp },
  { to: '/knowledge', label: 'Knowledge Base', icon: Database },
];

export default function Sidebar({ collapsed, onToggle, theme, onToggleTheme }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Activity size={24} />
        </div>
        {!collapsed && (
          <span className="sidebar-logo-text">
            Med<span className="text-gradient">Inventory</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="sidebar-link-icon">
              <Icon size={20} />
            </span>
            {!collapsed && <span className="sidebar-link-label">{label}</span>}
            {!collapsed && <span className="sidebar-link-indicator" />}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="sidebar-footer">
        <button
          className="sidebar-footer-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && (
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        <button className="sidebar-footer-btn" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
