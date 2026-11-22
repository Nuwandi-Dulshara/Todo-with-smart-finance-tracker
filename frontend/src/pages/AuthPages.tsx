
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Moon,
  Sun,
} from "lucide-react";
import "./Auth.css";

type Theme = "dark" | "light";
type AuthEndpoint = "login" | "register";
type AuthUser = {
  id: string;
  full_name: string;
  email: string;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorDetail(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const detail = payload.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) =>
        isRecord(item) && typeof item.msg === "string" ? item.msg : undefined
      )
      .filter((message): message is string => message !== undefined);
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }
  return undefined;
}

function isAuthUser(payload: unknown): payload is AuthUser {
  return (
    isRecord(payload) &&
    typeof payload.id === "string" &&
    typeof payload.full_name === "string" &&
    typeof payload.email === "string"
  );
}

async function submitAuthRequest(
  endpoint: AuthEndpoint,
  payload: Record<string, string | boolean>
): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Unable to reach the backend. Check that the API server is running."
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("The backend returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      getErrorDetail(body) ?? `Authentication failed (${response.status}).`
    );
  }
  if (!isAuthUser(body)) {
    throw new Error("The backend returned an unexpected authentication response.");
  }
  return body;
}

function useAuthTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem("organix-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("organix-theme", theme);
    } catch {
      // Theme still works without storage.
    }
  }, [theme]);

  return {
    theme,
    toggleTheme: () =>
      setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
}

function AuthLogo() {
  return (
    <Link className="auth-brand" to="/" aria-label="Organix AI home">
      <span className="auth-brand-symbol" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span>
        Organix<span className="auth-brand-ai">AI</span>
      </span>
    </Link>
  );
}

function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { theme, toggleTheme } = useAuthTheme();

  return (
    <div className="auth-page">
      <header className="auth-header">
        <AuthLogo />

        <div className="auth-header-actions">
          <Link to="/" className="auth-back">
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>

          <button
            type="button"
            className="auth-theme-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-form-side">
          <div className="auth-form-container">
            {children}

            <p className="auth-security-note">
              Passwords are submitted only to the API and are never saved in
              browser storage.
            </p>
          </div>

          <div className="auth-form-footer">
            © {new Date().getFullYear()} Organix AI
          </div>
        </section>
      </main>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="auth-eye-button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function passwordChecks(password: string) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await submitAuthRequest("login", {
        email: email.trim(),
        password,
        remember_me: remember,
      });
      setPassword("");
      setMessage(`Welcome back, ${user.full_name}. Your session is active.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to sign in."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-form-intro">
        <h2>Sign in to your account</h2>
        <p>
          Enter your email and password to continue to your workspace.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <div className="auth-field">
          <label htmlFor="login-email">Email address</label>
          <div className="auth-input-wrap">
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <div className="auth-form-options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <span className="auth-muted-link">
            Forgot password?
          </span>
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        {message && (
          <p className="auth-feedback" role="status">
            {message}
          </p>
        )}
      </form>

      <div className="auth-switch">
        Don't have an account?{" "}
        <Link to="/register">Create an account</Link>
      </div>

    </AuthLayout>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checks = passwordChecks(password);
  const strength = checks.filter(Boolean).length;
  const strengthLabel =
    password.length === 0
      ? "Enter a password"
      : strength <= 2
        ? "Weak"
        : strength <= 4
          ? "Good"
          : "Strong";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setMessage("");

    if (fullName.trim().length < 2) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!checks.every(Boolean)) {
      setMessage("Please meet all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setMessage("Please agree to the terms to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAuthRequest("register", {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      setPassword("");
      setConfirmPassword("");
      navigate("/login", { replace: true });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-form-intro">
        <h2>Create your account</h2>
        <p>
          Create an account to set up your workspace.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <div className="auth-field">
          <label htmlFor="register-name">Full name</label>
          <div className="auth-input-wrap">
            <input
              id="register-name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Email address</label>
          <div className="auth-input-wrap">
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <PasswordField
          id="register-password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Create a strong password"
          autoComplete="new-password"
        />

        <div className="auth-password-strength">
          <div className="auth-strength-header">
            <span>Password strength</span>
            <strong>{strengthLabel}</strong>
          </div>

          <div className="auth-strength-bars">
            {[1, 2, 3, 4, 5].map((level) => (
              <span
                key={level}
                className={level <= strength ? "active" : ""}
              />
            ))}
          </div>

          <div className="auth-password-hints">
            {[
              "At least 8 characters",
              "One uppercase letter",
              "One lowercase letter",
              "One number",
              "One special character",
            ].map((hint, index) => (
              <span
                key={hint}
                className={checks[index] ? "fulfilled" : ""}
                aria-label={`${hint}: ${checks[index] ? "met" : "not met"}`}
              >
                {hint}
              </span>
            ))}
          </div>
        </div>

        <PasswordField
          id="register-confirm"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />

        {confirmPassword && (
          <div
            className={`auth-match-message ${
              password === confirmPassword ? "matched" : ""
            }`}
          >
            {password === confirmPassword
              ? "Passwords match"
              : "Passwords do not match"}
          </div>
        )}

        <label className="auth-checkbox auth-terms">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            required
          />
          <span>
            I agree to the Terms of Service and Privacy Policy
            (documents to be added).
          </span>
        </label>

        <button
          type="submit"
          className="auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        {message && (
          <p className="auth-feedback" role="status">
            {message}
          </p>
        )}
      </form>

      <div className="auth-switch">
        Already have an account?{" "}
        <Link to="/login">Sign in instead</Link>
      </div>

    </AuthLayout>
  );
}
