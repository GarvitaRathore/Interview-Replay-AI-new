import apiClient from "./apiClient";

// matches interviews/urls.py -> CreateInterviewView
// expects: { interview_type, experience, difficulty, topic, number_of_questions }
export const createInterview = (data) => apiClient.post("/interviews/create/", data);

// matches interviews/urls.py -> InterviewQuestionsView
export const getInterviewQuestions = (interviewId) =>
  apiClient.get(`/interviews/questions/${interviewId}/`);

// matches interviews/urls.py -> SubmitAnswerView
// expects: { user_answer } — that's the only field SubmitAnswerView/
// UserAnswerSerializer reads. score/feedback/filler_words are computed later,
// all at once, by InterviewResultView when the results page is loaded.
export const submitAnswer = (questionId, data) =>
  apiClient.post(`/interviews/submit/${questionId}/`, data);

// matches interviews/urls.py -> InterviewResultView
export const getInterviewResults = (interviewId) =>
  apiClient.get(`/interviews/results/${interviewId}/`);

export const getMyInterviews = () => apiClient.get("/interviews/");
export const uploadReferencePhoto = (interviewId, photoBlob) => {
  const formData = new FormData();
  formData.append("photo", photoBlob, "reference.jpg");
  return apiClient.post(`/interviews/upload-photo/${interviewId}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const reportViolation = (interviewId, eventType, meta = {}) =>
  apiClient.post(`/interviews/violation/${interviewId}/`, { event_type: eventType, meta });