/**
 * Utility to retrieve and append required API headers.
 * Keeps standard configuration in one dedicated, clean location.
 */

export const getApiHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    // Bypass the ngrok browser warning interceptor page
    "ngrok-skip-browser-warning": "true",
  };

  const token = localStorage.getItem("auth_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * RTK Query prepareHeaders helper
 */
export const prepareApiHeaders = (headers: Headers, endpoint?: string): Headers => {
  if (endpoint !== "addBlog" && endpoint !== "updateBlog" && endpoint !== "deleteBlog" && endpoint !== "addCaseStudy" && endpoint !== "updateCaseStudy") {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  headers.set("ngrok-skip-browser-warning", "true");

  // Skip Authorization header for public endpoints to prevent stale tokens from blocking requests
  const publicEndpoints = ["login", "forgotPassword", "verifyOtp", "resendOtp"];
  if (endpoint && publicEndpoints.includes(endpoint)) {
    return headers;
  }

  const token = localStorage.getItem("auth_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};
