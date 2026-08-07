// CreateInterview.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import { createInterview } from "../api/interviews";
import { addRecentInterview } from "../utils/recentInterviews";
import "./CreateInterview.css";

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

// Mirrors InterviewSession's model choices exactly (interviews/models.py)
const INTERVIEW_TYPES = [
  { value: "HR", label: "HR", desc: "Behavioural & culture-fit questions" },
  { value: "TECHNICAL", label: "Technical", desc: "Role-specific technical depth" },
  { value: "MIXED", label: "Mixed", desc: "A blend of both" },
];

const EXPERIENCE_LEVELS = [
  { value: "FRESHER", label: "Fresher" },
  { value: "LOW", label: "1–2 Years" },
  { value: "MID", label: "3–5 Years" },
  { value: "HIGH", label: "6–10 Years" },
];

const DIFFICULTIES = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

function CreateInterview() {
  const navigate = useNavigate();

  const [interviewType, setInterviewType] = useState("TECHNICAL");
  const [experience, setExperience] = useState("FRESHER");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await createInterview({
        interview_type: interviewType,
        experience,
        difficulty,
        topic,
        number_of_questions: Number(numberOfQuestions),
      });

      const interviewId = res.data.interview_id;
      if (interviewId) {
        addRecentInterview({
          id: interviewId,
          interview_type: interviewType,
          experience,
          difficulty,
          topic,
          number_of_questions: Number(numberOfQuestions),
        });
        navigate(`/interview/${interviewId}`);
      } else {
        setError("Interview was created but no interview_id was returned. Check CreateInterviewView's response.");
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <AppNavbar />

      <div className="create-blob create-blob-1"></div>

      <div className="create-wrap">
        <div className="create-heading">
          <span className="tag">New Interview</span>
          <h1>Set up your mock interview</h1>
          <p>Choose a type, level and topic — questions are generated for you.</p>
        </div>

        <form className="create-card" onSubmit={handleSubmit}>
          <label>Interview type</label>
          <div className="option-grid option-grid-3">
            {INTERVIEW_TYPES.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={interviewType === opt.value ? "option-card selected" : "option-card"}
                onClick={() => setInterviewType(opt.value)}
              >
                <strong>{opt.label}</strong>
                <small>{opt.desc}</small>
              </button>
            ))}
          </div>

          <label>Experience level</label>
          <div className="option-grid option-grid-4">
            {EXPERIENCE_LEVELS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={experience === opt.value ? "option-pill selected" : "option-pill"}
                onClick={() => setExperience(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label>Difficulty</label>
          <div className="option-grid option-grid-3">
            {DIFFICULTIES.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={difficulty === opt.value ? "option-pill selected" : "option-pill"}
                onClick={() => setDifficulty(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label htmlFor="topic">Topic</label>
          <input
            id="topic"
            type="text"
            placeholder="e.g. React, System Design, Django REST"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />

          <label htmlFor="numQuestions">Number of questions</label>
          <input
            id="numQuestions"
            type="number"
            min="1"
            max="20"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(e.target.value)}
            required
          />

          {error && <p className="create-error">{error}</p>}

          <button type="submit" className="create-submit" disabled={loading}>
            {loading ? "Generating questions…" : "Start Interview"}
          </button>

          <Link to="/dashboard" className="create-cancel">
            Cancel
          </Link>
        </form>
      </div>
    </div>
  );
}

export default CreateInterview;
