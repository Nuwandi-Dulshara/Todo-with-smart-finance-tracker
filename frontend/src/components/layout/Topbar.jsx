import { Bell, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

function Topbar({ unreadCount, isAuthenticated, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button mobile-only" type="button" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <Link to="/" className="logo-link">
          <img className="brand-logo brand-logo-header" src="/logo/logo.png" alt="Organix AI" />
        </Link>
      </div>
      <div className="topbar-actions">
        <Link className="notification-link" to="/notifications" aria-label="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </Link>
        <Link
          className="signup-button"
          to={isAuthenticated ? '/expense-tracker/dashboard' : '/signup'}
        >
          {isAuthenticated ? 'Dashboard' : 'Sign Up'}
        </Link>
      </div>
    </header>
  )
}

export default Topbar
