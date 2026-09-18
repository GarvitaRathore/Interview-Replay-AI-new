// Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, verifyOtp, resendOtp } from "../api/auth";
import "./Auth.css";

function parseApiError(err) {
  const data = err.response?.data;
  if (!data) return "Something went wrong. Please try again.";
  if (typeof data === "string") return data;
  if (data.error) {
    return typeof data.error === "string" ? data.error : JSON.stringify(data.error);
  }
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

function Register() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await registerUser({
        username,
        email,
        password,
        target_role: targetRole,
        github,
        linkedin,
      });

      setAwaitingOtp(true); // account created — show the OTP form instead of navigating
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setVerifying(true);

    try {
      const res = await verifyOtp(username, otp);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/dashboard");
    } catch (err) {
      setOtpError(parseApiError(err));
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    try {
      await resendOtp(username);
      setOtpError("A new code has been sent.");
    } catch (err) {
      setOtpError(parseApiError(err));
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
          <h1>Start practicing<br />with confidence.</h1>
          <p>
            Create a free account to get AI-generated interview questions,
            instant feedback, and a record of every session.
          </p>

          <div className="auth-brand-tags">
            <span className="cc-tag">Free to start</span>
            <span className="cc-tag">No credit card</span>
          </div>
        </div>

      </div>

      <div className="auth-form-side">

        <div className="auth-card">

          {!awaitingOtp ? (
            <>
              <h2>Create your account</h2>
              <p className="auth-sub">Start practicing in less than a minute.</p>

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

                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <label htmlFor="targetRole">Target role <span className="optional-tag">optional</span></label>
                <input
                  id="targetRole"
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />

                <label htmlFor="github">GitHub <span className="optional-tag">optional</span></label>
                <input
                  id="github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />

                <label htmlFor="linkedin">LinkedIn <span className="optional-tag">optional</span></label>
                <input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourusername"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? "Creating account..." : "Register"}
                </button>

              </form>

              <p className="auth-switch">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </>
          ) : (
            <>
              <h2>Enter verification code</h2>
              <p className="auth-sub">We sent a 6-digit code to {email}.</p>

              <form onSubmit={handleVerifyOtp}>
                <label htmlFor="otp">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />

                {otpError && <p className="auth-error">{otpError}</p>}

                <button type="submit" className="auth-submit" disabled={verifying}>
                  {verifying ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>

              <p className="auth-switch">
                Didn't get a code? <a href="#resend" onClick={handleResendOtp}>Resend code</a>
              </p>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default Register;