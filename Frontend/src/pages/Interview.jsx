// Interview.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import { getInterviewQuestions, submitAnswer } from "../api/interviews";
import "./Interview.css";

const SpeechRecognitionAPI =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    getInterviewQuestions(id)
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => a.question_order - b.question_order);
        setQuestions(sorted);
      })
      .catch(() => {
        setLoadError("Couldn't load this interview's questions. It may not exist, or may not belong to your account.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // set up speech recognition once the browser supports it
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true; // lets words show up live, not just after stopping
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      setLiveTranscript(interimText);

      if (finalText) {
        setAnswer((prev) => `${prev} ${finalText}`.trim());
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setLiveTranscript("");
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setLiveTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecordingIfActive = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setLiveTranscript("");
    }
  };

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progressPct = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentQuestion) return;

    stopRecordingIfActive();
    setSubmitError("");
    setSubmitting(true);

    try {
      // SubmitAnswerView only reads user_answer — score/feedback/filler_words
      // are computed later, all at once, when the results page loads.
      await submitAnswer(currentQuestion.id, { user_answer: answer });

      setAnswer("");

      if (isLast) {
        navigate(`/result/${id}`);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.error ||
          "Couldn't submit that answer. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    stopRecordingIfActive();
    setAnswer("");
    setSubmitError("");
    if (isLast) {
      navigate(`/result/${id}`);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (loading) {
    return (
      <div className="interview-page">
        <AppNavbar />
        <p className="interview-status">Loading your questions…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="interview-page">
        <AppNavbar />
        <div className="interview-status">
          <p>{loadError}</p>
          <Link to="/dashboard" className="interview-back-link">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="interview-page">
        <AppNavbar />
        <div className="interview-status">
          <p>This interview doesn't have any questions yet.</p>
          <Link to="/dashboard" className="interview-back-link">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page">
      <AppNavbar />

      <div className="interview-wrap">

        <div className="interview-progress-row">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="interview-category">{currentQuestion.category}</span>
        </div>

        <div className="interview-progress-track">
          <div className="interview-progress-fill" style={{ width: `${progressPct}%` }}></div>
        </div>

        <div className="interview-card">
          <h2>{currentQuestion.question_text}</h2>

          <form onSubmit={handleSubmit}>

            <div className="answer-layout">

              <div className="answer-box">
                <textarea
                  placeholder="Type your answer here, or use the mic to speak it…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={8}
                  required
                />

                {SpeechRecognitionAPI && (
                  <button
                    type="button"
                    className={`mic-btn ${isRecording ? "recording" : ""}`}
                    onClick={toggleRecording}
                    title={isRecording ? "Stop recording" : "Record your answer"}
                  >
                    🎤
                  </button>
                )}
              </div>

              {SpeechRecognitionAPI && (
                <div className="transcript-panel">
                  <span className="transcript-label">
                    {isRecording ? "Listening…" : "Live Transcript"}
                  </span>
                  <p className={liveTranscript ? "" : "transcript-placeholder"}>
                    {liveTranscript || "Your speech will appear here as you talk."}
                  </p>
                </div>
              )}

            </div>

            {!SpeechRecognitionAPI && (
              <p className="mic-unsupported">Voice input isn't supported in this browser — try Chrome or Edge.</p>
            )}

            {submitError && <p className="interview-error">{submitError}</p>}

            <div className="interview-actions">
              <button type="button" className="interview-skip" onClick={handleSkip} disabled={submitting}>
                Skip question
              </button>

              <button type="submit" className="interview-submit" disabled={submitting}>
                {submitting ? "Submitting…" : isLast ? "Finish Interview" : "Next Question"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Interview;
