// recentInterviews.js
//
// Your backend has no "list my interviews" endpoint (interviews/urls.py only
// has create/, questions/<id>/, submit/<id>/, results/<id>/), and adding one
// is more than you want to touch before tomorrow's presentation.
//
// This is the zero-backend-change workaround: every time CreateInterview.jsx
// successfully creates an interview, it saves a small record of it here, in
// this browser's localStorage. Dashboard.jsx reads that list back out.
//
// The list is namespaced per logged-in user (by user_id decoded out of the
// JWT access token), so logging into the same browser as a different user
// shows that user's own list, not whoever used the browser last.
//
// Tradeoffs, so there are no surprises during the demo:
// - It's per-browser AND per-account-on-that-browser. Log in on a different
//   browser/device and the list is empty, even though the interviews exist
//   in the database.
// - It only shows interviews created THROUGH this frontend from now on —
//   nothing from before you added this, and nothing created via /admin.
// - It doesn't know real status (COMPLETED vs PENDING) — that's tracked in
//   Django, not here — so Dashboard only offers "View Results", never
//   "Continue", to avoid resubmitting an already-answered question (that
//   would crash SubmitAnswerView — UserAnswer.question is a OneToOneField).
//
// When you do have time to add the real backend endpoint, delete this file
// and swap Dashboard.jsx back to calling it — everything else stays the same.

const MAX_ENTRIES = 12;

function getCurrentUserId() {
  const token = localStorage.getItem("access");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id ?? null;
  } catch {
    return null;
  }
}

function storageKey() {
  const userId = getCurrentUserId();
  // no valid token → fall back to a key that holds nothing useful, rather
  // than accidentally reading/writing whichever user logged in last
  return userId ? `recent_interviews_${userId}` : "recent_interviews_guest";
}

export function getRecentInterviews() {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentInterview({ id, interview_type, experience, difficulty, topic, number_of_questions }) {
  try {
    const existing = getRecentInterviews();
    const next = [
      { id, interview_type, experience, difficulty, topic, number_of_questions, created_at: new Date().toISOString() },
      ...existing.filter((entry) => entry.id !== id),
    ].slice(0, MAX_ENTRIES);
    localStorage.setItem(storageKey(), JSON.stringify(next));
  } catch {
    // localStorage can fail (private browsing, quota) — never let this
    // block the actual interview flow.
  }
}
