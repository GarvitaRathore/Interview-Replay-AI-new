// Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import { getRecentInterviews } from "../utils/recentInterviews";
import "./Dashboard.css";

// Small label maps so the raw model choice codes (e.g. "MID") render nicely.
const EXPERIENCE_LABELS = {
  FRESHER: "Fresher",
  LOW: "1–2 yrs",
  MID: "3–5 yrs",
  HIGH: "6–10 yrs",
};

function Dashboard() {
  // No backend "list my interviews" endpoint exists yet, so this reads from
  // a client-side tracker instead (see src/utils/recentInterviews.js for the
  // full explanation and tradeoffs). Swap this for a real API call once you
  // add that endpoint — nothing else on this page needs to change.
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    setInterviews(getRecentInterviews());
  }, []);

  const totalQuestionsPracticed = interviews.reduce(
    (sum, i) => sum + (Number(i.number_of_questions) || 0),
    0
  );
  const lastTopic = interviews[0]?.topic || "—";

  return (
    <div className="dashboard">
      <AppNavbar />

      <div className="dash-blob dash-blob-1"></div>
      <div className="dash-blob dash-blob-2"></div>

      <section className="dash-hero">
        <div>
          <span className="tag">Your Dashboard</span>
          <h1>Ready for your next round?</h1>
          <p>
            Start a fresh mock interview, or jump back into feedback from
            one you've already done.
          </p>
        </div>

        <Link to="/create" className="dash-cta">
          <span className="dash-cta-icon">+</span>
          <div>
            <strong>Start New Interview</strong>
            <small>Pick a type, topic and difficulty</small>
          </div>
        </Link>
      </section>

      <section className="dash-stats">
        <div className="stat-box">
          <h2>{interviews.length}</h2>
          <p>Interviews Started</p>
        </div>
        <div className="stat-box">
          <h2>{totalQuestionsPracticed}</h2>
          <p>Questions Practiced</p>
        </div>
        <div className="stat-box">
          <h2 className="stat-box-text">{lastTopic}</h2>
          <p>Last Topic</p>
        </div>
      </section>

      <section className="dash-list-section">
        <div className="section-heading-left">
          <h2>Recent interviews</h2>
        </div>

        {interviews.length === 0 && (
          <div className="dash-empty">
            <p>No interviews yet. Your first one takes about a minute to set up.</p>
            <Link to="/create" className="dash-empty-btn">
              Start your first interview
            </Link>
          </div>
        )}

        {interviews.length > 0 && (
          <div className="dash-grid">
            {interviews.map((interview) => (
              <div className="dash-card" key={interview.id}>
                <div className="dash-card-top">
                  <span className="dash-card-date">
                    {new Date(interview.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3>{interview.topic || interview.interview_type}</h3>

                <div className="dash-card-tags">
                  <span className="cc-tag">{interview.interview_type}</span>
                  <span className="cc-tag">{EXPERIENCE_LABELS[interview.experience] || interview.experience}</span>
                  <span className="cc-tag">{interview.difficulty}</span>
                </div>

                <p className="dash-card-meta">{interview.number_of_questions} questions</p>

                <Link to={`/result/${interview.id}`} className="dash-card-btn">
                  View Results
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
