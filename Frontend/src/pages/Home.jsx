// Home.jsx
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="home">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">

          <div className="logo-circle">
            IR
          </div>

          <div>
            <h2>Interview Replay</h2>
            <p>AI Interview Platform</p>
          </div>

        </div>

        <div className="nav-links">

          <button onClick={() => scrollTo("features")}>
            Features
          </button>

          <button onClick={() => scrollTo("about")}>
            About
          </button>

          <button onClick={() => scrollTo("contact")}>
            Contact
          </button>

          <Link to="/login">
            <button className="login-btn">
              Login
            </button>
          </Link>

          <Link to="/register">
            <button className="register-btn">
              Register
            </button>
          </Link>

        </div>

      </nav>

      {/* HERO */}

      <section className="hero">

        <div className="hero-blob hero-blob-1"></div>
        <div className="hero-blob hero-blob-2"></div>

        <div className="hero-left">

          <span className="tag">
            AI Powered Interview Practice
          </span>

          <h1>
            Ace every
            <span> interview.</span>
          </h1>

          <p>
            Practice technical interviews with AI-powered evaluation,
            speech analysis, keyword detection and personalized
            feedback to boost your confidence.
          </p>

          <div className="hero-buttons">

            <Link to="/login">
              <button className="primary-btn">
                Login
              </button>
            </Link>

            <button
              className="secondary-btn"
              onClick={() => scrollTo("features")}
            >
              Learn More
            </button>

          </div>

        </div>

        <div className="hero-right">

          <div className="confidence-card">

            <div className="cc-header">
              <span className="cc-dot"></span>
              Live Session
            </div>

            <div className="cc-ring">
              <div className="cc-ring-inner">
                <strong>92%</strong>
                <small>Confidence</small>
              </div>
            </div>

            <div className="cc-bars">
              <span style={{ height: "35%" }}></span>
              <span style={{ height: "60%" }}></span>
              <span style={{ height: "85%" }}></span>
              <span style={{ height: "50%" }}></span>
              <span style={{ height: "70%" }}></span>
              <span style={{ height: "40%" }}></span>
            </div>

            <div className="cc-tags">
              <span className="cc-tag">Clarity: High</span>
              <span className="cc-tag">Pace: Steady</span>
              <span className="cc-tag">Keywords 8/10</span>
            </div>

          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="stats">

        <div className="stat-box">
          <h2>95%</h2>
          <p>Evaluation Accuracy</p>
        </div>

        <div className="stat-box">
          <h2>500+</h2>
          <p>Practice Sessions</p>
        </div>

        <div className="stat-box">
          <h2>24/7</h2>
          <p>Available Anytime</p>
        </div>

        <div className="stat-box">
          <h2>AI</h2>
          <p>Personalized Feedback</p>
        </div>

      </section>

      {/* FEATURES */}

      <section id="features" className="features">

        <div className="section-heading">
          <span className="section-tag">Features</span>
          <h2>Why choose Interview Replay AI?</h2>
          <p>Everything you need to walk into your next interview prepared and confident.</p>
        </div>

        <div className="feature-bento">

          <div className="fb-card fb-big">
            <div>
              <div className="feature-icon fb-icon-big">🤖</div>
              <h3>AI Evaluation</h3>
              <p>Receive intelligent scores and actionable suggestions on every answer, powered by AI.</p>
            </div>
            <div className="fb-score">
              <span>Avg. Session Score</span>
              <strong>8.7/10</strong>
            </div>
          </div>

          <div className="fb-card fb-voice">
            <div className="feature-icon">🎤</div>
            <h3>Voice Recording</h3>
            <p>Record answers naturally with speech recognition.</p>
          </div>

          <div className="fb-card fb-perf">
            <div className="feature-icon">📊</div>
            <h3>Performance Tracking</h3>
            <p>Monitor improvement after every interview.</p>
          </div>

          <div className="fb-card fb-key">
            <div className="feature-icon">🔑</div>
            <h3>Keyword Detection</h3>
            <p>Know whether important concepts were covered.</p>
          </div>

          <div className="fb-card fb-sugg">
            <div className="feature-icon">💡</div>
            <h3>Suggestions</h3>
            <p>Understand exactly what needs improvement.</p>
          </div>

          <div className="fb-card fb-wide">
            <div className="feature-icon">📝</div>
            <div className="fb-wide-text">
              <h3>Transcript</h3>
              <p>Review every answer, word for word, after your interview.</p>
            </div>
          </div>

        </div>

      </section>

      {/* ABOUT */}

      <section id="about" className="about">

        <h2>How it works</h2>

        <div className="timeline">

          <div className="timeline-step">
            <span>1</span>
            <p>Create Interview</p>
          </div>

          <div className="line"></div>

          <div className="timeline-step">
            <span>2</span>
            <p>Answer Questions</p>
          </div>

          <div className="line"></div>

          <div className="timeline-step">
            <span>3</span>
            <p>AI Analysis</p>
          </div>

          <div className="line"></div>

          <div className="timeline-step">
            <span>4</span>
            <p>View Results</p>
          </div>

        </div>

      </section>

      {/* CONTACT */}

      <section id="contact" className="contact">

        <div className="contact-card">

          <h2>Contact us</h2>
          <p className="contact-sub">Have a question? Reach out anytime.</p>

          <div className="contact-rows">

            <div className="contact-row">
              <span className="contact-icon">📧</span>
              <p>interviewreplay@gmail.com</p>
            </div>

            <div className="contact-row">
              <span className="contact-icon">📱</span>
              <p>+91 XXXXX XXXXX</p>
            </div>

            <div className="contact-row">
              <span className="contact-icon">💻</span>
              <p>github.com/yourusername</p>
            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <h2>Interview Replay AI</h2>

        <p>
          Practice • Analyze • Improve
        </p>

        <small>
          Built with React • Django • Gemini AI
        </small>

      </footer>

    </div>
  );
}

export default Home;
