// Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import "./Auth.css";

function parseApiError(err) {
  // A 401 here can only mean one thing from LoginView: the username doesn't
  // exist, or the password is wrong.
  if (err.response?.status === 401) {
    return "Incorrect username or password.";
  }

  const data = err.response?.data;
  if (!data) return "Something went wrong. Please try again.";
  if (typeof data === "string") return data;
  if (data.error) {
    return typeof data.error === "string" ? data.error : "Incorrect username or password.";
  }
  // DRF serializer.errors shape: { field: ["msg1", "msg2"], ... }
  try {
    return Object.entries(data)
      .map(([field, msgs]) => {
        const text = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
        return field === "non_field_errors" ? text : `${field}: ${text}`;
      })
      .join(" ");
  } catch {
    return "Something went wrong. Please try again.";
  }
}

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ username, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", username);

      navigate("/dashboard");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-brand">

        <div className="auth-blob auth-blob-1"></div>
        <div className="auth-blob auth-blob-2"></div>

        <Link to="/" className="auth-logo">
          <div className="logo-circle">IR</div>
          <div>
            <h2>Interview Replay</h2>
            <p>AI Interview Platform</p>
          </div>
        </Link>

        <div className="auth-brand-content">
          <h1>Welcome back.<br />Let's keep practicing.</h1>
          <p>
            Pick up where you left off — review your last session's
            feedback or start a fresh mock interview.
          </p>

          <div className="auth-brand-tags">
            <span className="cc-tag">AI Evaluation</span>
            <span className="cc-tag">Speech Analysis</span>
            <span className="cc-tag">Progress Tracking</span>
          </div>
        </div>

      </div>

      <div className="auth-form-side">

        <div className="auth-card">

          <h2>Login</h2>
          <p className="auth-sub">Enter your details to access your account.</p>

          <form onSubmit={handleSubmit}>

            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="auth-row">
              <label className="remember-me">
                <input type="checkbox" />
                Remember me
              </label>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Register</Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
