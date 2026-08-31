import NotificationPanel from '../components/notifications/NotificationPanel'

function Notifications({ notifications, onMarkRead, onMarkAllRead, onClear, onOpenTask }) {
  return (
    <div className="page-grid">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Notifications</p>
          <h1>Stay ahead of unfinished work.</h1>
        </div>
      </section>
      <NotificationPanel
        notifications={notifications}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
        onClear={onClear}
        onOpenTask={onOpenTask}
      />
    </div>
  )
}

export default Notifications
