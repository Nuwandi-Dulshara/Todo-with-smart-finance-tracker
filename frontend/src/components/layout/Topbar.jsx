import { Bell, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

function Topbar({ unreadCount, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button mobile-only" type="button" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <Link to="/" className="logo-link">
          <span className="logo-dot" />
          <span>TaskFlow</span>
        </Link>
      </div>
      <div className="topbar-actions">
        <Link className="notification-link" to="/notifications" aria-label="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </Link>
        <button className="signup-button" type="button" disabled>
          Sign Up
        </button>
      </div>
    </header>
  )
}

export default Topbar
