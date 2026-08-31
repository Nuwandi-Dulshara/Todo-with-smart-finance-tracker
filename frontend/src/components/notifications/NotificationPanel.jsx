import { BellRing, CheckCheck, ExternalLink, Trash2 } from 'lucide-react'

function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClear, onOpenTask }) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Notifications</p>
          <h2>Task alerts</h2>
        </div>
        <button className="secondary-button" type="button" onClick={onMarkAllRead}>
          <CheckCheck size={17} />
          Mark all as read
        </button>
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-state">No notifications right now.</div>
        ) : (
          notifications.map((notification) => (
            <article
              className={`notification-card ${notification.read ? 'is-read' : ''} ${notification.type}`}
              key={notification.id}
            >
              <span className="notification-icon">
                <BellRing size={18} />
              </span>
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
              </div>
              <div className="notification-actions">
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => onOpenTask(notification.taskId, notification.id)}
                  aria-label="Open related task"
                >
                  <ExternalLink size={17} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => onMarkRead(notification.id)}
                  aria-label="Mark as read"
                >
                  <CheckCheck size={17} />
                </button>
                <button
                  className="icon-button danger"
                  type="button"
                  onClick={() => onClear(notification.id)}
                  aria-label="Clear notification"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default NotificationPanel
