function AuthLayout({ mode, title, subtitle, children }) {
  const isRegister = mode === 'register'

  return (
    <main className={`auth-page auth-page-${mode}`}>
      <section className="auth-card" aria-label={`${title} to Organix AI`}>
        <aside className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-mark" aria-hidden="true">
              <img className="brand-logo brand-logo-auth" src="/logo/logo.png" alt="" />
            </div>
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
            <span className="eyebrow">Organix AI</span>
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
