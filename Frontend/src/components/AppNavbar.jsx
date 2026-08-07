// AppNavbar.jsx
// Shared top bar for every logged-in page (Dashboard, CreateInterview, Interview, Result).
// Mirrors the public Home.jsx navbar visually, but adds a logout action and
// active-route highlighting instead of the marketing scroll-links.
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AppNavbar.css";

function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Login.jsx never stores a username today — this reads it if you add
  // `localStorage.setItem("username", username)` after a successful login.
  // Falls back to a generic greeting if it isn't there.
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="app-navbar">
      <Link to="/dashboard" className="app-logo">
        <div className="logo-circle">IR</div>
        <div>
          <h2>Interview Replay</h2>
          <p>{username ? `Hi, ${username}` : "AI Interview Platform"}</p>
        </div>
      </Link>

      <div className="app-nav-links">
        <Link
          to="/dashboard"
          className={isActive("/dashboard") ? "app-nav-link active" : "app-nav-link"}
        >
          Dashboard
        </Link>

        <Link
          to="/create"
          className={isActive("/create") ? "app-nav-link active" : "app-nav-link"}
        >
          New Interview
        </Link>

        <button className="app-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AppNavbar;
