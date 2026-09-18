import apiClient from "./apiClient";

// matches users/urls.py -> RegisterView
// expects: { username, email, password, target_role, github, linkedin }
export const registerUser = (data) => apiClient.post("/users/register/", data);

// matches users/urls.py -> LoginView
// expects: { username, password }
// returns: { access, refresh }
export const loginUser = (data) => apiClient.post("/users/login/", data);
export const verifyOtp = (username, otp) =>
  apiClient.post("/users/verify-otp/", { username, otp });

export const resendOtp = (username) =>
  apiClient.post("/users/resend-otp/", { username });