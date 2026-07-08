import { Search, Bell, Menu } from 'lucide-react';
import './Header.css';

export default function Header({ title, subtitle, onMobileMenu }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="header-mobile-menu" onClick={onMobileMenu}>
          <Menu size={22} />
        </button>
        <div className="header-title-group">
          {subtitle && <span className="header-subtitle">{subtitle}</span>}
          <h1 className="header-title">{title}</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search inventory…"
            className="header-search-input"
          />
          <kbd className="header-search-kbd">⌘K</kbd>
        </div>

        <button className="header-icon-btn" id="notifications-btn">
          <Bell size={20} />
          <span className="header-notification-dot" />
        </button>

        <div className="header-avatar" id="user-avatar">
          <span>MR</span>
        </div>
      </div>
    </header>
  );
}
