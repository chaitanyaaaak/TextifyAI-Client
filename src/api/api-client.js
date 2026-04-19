/**
 * Base API client for TextifyAI
 * Handles communication with the FastAPI backend
 */

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8001";
const API_BASE = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl.replace(/\/$/, "")}/api`;

/**
 * Generic API request wrapper
 * @param {string} endpoint - API endpoint (e.g., "/chat")
 * @param {object} body - Request body
 * @param {object} options - Fetch options (method, headers, signal, etc.)
 * @returns {Promise<any>} - JSON response
 */
async function api(endpoint, body, options = {}) {
  const isFormData = body instanceof FormData;
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: options.method || "POST",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options,
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("You're sending requests too quickly. Please wait a moment and try again.");
      }
      if (res.status >= 500) {
        throw new Error("The server encountered an issue. Our team has been notified. Please try again later.");
      }

      let message = "API error";
      try {
        const err = await res.json();
        message = err.detail || err.message || message;
      } catch {
        // Ignore parse error, use default message
      }
      throw new Error(message);
    }
    
    return res.json();
  } catch (error) {
    if (error.name === "AbortError") throw error;
    
    // Categorize network errors
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      throw new Error("The server is currently unavailable. Please check your internet connection or try again later.");
    }
    
    throw error;
  }
}

export { api, API_BASE };
