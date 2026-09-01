import { CalendarCheck2, ListTodo } from 'lucide-react'

function AuthLayout({ mode, title, subtitle, children }) {
  const isRegister = mode === 'register'

  return (
    <main className={`auth-page auth-page-${mode}`}>
      <section className="auth-card" aria-label={`${title} to Task Flow`}>
        <aside className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-mark" aria-hidden="true">
              {isRegister ? <CalendarCheck2 size={34} /> : <ListTodo size={34} />}
            </div>
            <p className="auth-brand-name">Task Flow</p>
            <h1>{isRegister ? 'Start Your Journey' : 'Welcome Back'}</h1>
            <p>
              {isRegister
                ? 'Create your account and organize your tasks, expenses, and daily activities in one place.'
                : 'Stay organized, track your tasks, manage your expenses, and keep your day under control.'}
            </p>
          </div>
        </aside>
        <section className="auth-form-panel">
          <div className="auth-form-head">
            <span className="eyebrow">Task Flow</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </section>
      </section>
    </main>
  )
}

export default AuthLayout
