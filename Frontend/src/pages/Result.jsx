// Result.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import { getInterviewResults } from "../api/interviews";
import "./Result.css";

function Result() {
  const { id } = useParams();

  // InterviewResultView returns:
  // { overall_score, total_questions, results: [{ question, expected_answer,
  //   user_answer, score, feedback, filler_words }] }
  // Note this is already the merged/averaged shape — no need to separately
  // fetch questions and stitch things together.
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getInterviewResults(id)
      .then((res) => setData(res.data))
      .catch(() => {
        setLoadError("Couldn't load results for this interview. It may not exist, or may not belong to your account.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="result-page">
        <AppNavbar />
        {/* InterviewResultView scores any un-scored answer with a live Gemini
            call, synchronously, right inside this GET request — for a
            multi-question interview that can take several seconds, so this
            message is intentionally set-expectations rather than a flicker. */}
        <p className="result-status">Scoring your answers — this can take a moment…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="result-page">
        <AppNavbar />
        <div className="result-status">
          <p>{loadError}</p>
          <Link to="/dashboard" className="result-back-link">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const { overall_score: overallScore, total_questions: totalQuestions, results } = data;
  const ringPct = Math.max(0, Math.min(100, Math.round(overallScore)));
  const totalFillerWords = results.reduce((sum, r) => sum + (r.filler_words || 0), 0);

  return (
    <div className="result-page">
      <AppNavbar />

      <div className="result-wrap">

        <div className="result-summary">
          <div
            className="cc-ring"
            style={{
              background: `conic-gradient(var(--pink-strong) 0% ${ringPct}%, var(--pink-soft) ${ringPct}% 100%)`,
            }}
          >
            <div className="cc-ring-inner">
              <strong>{Math.round(overallScore)}</strong>
              <small>Avg. Score / 100</small>
            </div>
          </div>

          <div className="result-summary-text">
            <span className="tag">Interview Complete</span>
            <h1>Here's how you did</h1>
            <p>Review the feedback on each answer below — it's the fastest way to improve next time.</p>

            <div className="result-mini-stats">
              <div>
                <strong>{totalQuestions}</strong>
                <small>Questions</small>
              </div>
              <div>
                <strong>{totalFillerWords}</strong>
                <small>Filler Words</small>
              </div>
            </div>
          </div>
        </div>

        <div className="result-breakdown">
          <h2>Question breakdown</h2>

          {results.length === 0 && (
            <p className="result-status" style={{ margin: 0, padding: "20px 0" }}>
              No answers were submitted for this interview yet.
            </p>
          )}

          {results.map((row, index) => (
            <div className="result-card" key={index}>
              <div className="result-card-top">
                <span className="result-card-index">Q{index + 1}</span>
                {row.score !== null && row.score !== undefined && (
                  <span className="result-card-score">{row.score}/100</span>
                )}
              </div>

              <h3>{row.question}</h3>

              {row.user_answer && (
                <div className="result-answer-block">
                  <label>Your answer</label>
                  <p>{row.user_answer}</p>
                </div>
              )}

              {row.feedback && (
                <div className="result-feedback-block">
                  <label>Feedback</label>
                  <p>{row.feedback}</p>
                </div>
              )}

              {row.expected_answer && (
                <div className="result-expected-block">
                  <label>Reference answer</label>
                  <p>{row.expected_answer}</p>
                </div>
              )}

              {row.filler_words != null && (
                <div className="result-card-meta">
                  <span>{row.filler_words} filler words</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Link to="/dashboard" className="result-dashboard-btn">
          Back to Dashboard
        </Link>

      </div>
    </div>
  );
}

export default Result;
