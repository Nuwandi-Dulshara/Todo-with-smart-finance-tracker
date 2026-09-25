import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  ListTodo,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'My Activities', path: '/activities', icon: ListTodo },
  { label: 'Today Activities', path: '/today', icon: CheckCircle2 },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Time Manage', path: '/time', icon: Clock3 },
  { label: 'Notifications', path: '/notifications', icon: Bell },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-head">
          <div className="brand-mark">
            <img className="brand-logo brand-logo-sidebar" src="/logo/logo.png" alt="Organix AI" />
          </div>
          <button className="icon-button mobile-only" type="button" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      {isOpen && <button className="sidebar-scrim" type="button" onClick={onClose} aria-label="Close menu" />}
    </>
  )
}

export default Sidebar
