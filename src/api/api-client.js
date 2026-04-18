/**
 * Base API client for TextifyAI
 * Handles communication with the FastAPI backend
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

/**
 * Generic API request wrapper
 * @param {string} endpoint - API endpoint (e.g., "/chat")
 * @param {object} body - Request body
 * @param {object} options - Fetch options (method, headers, signal, etc.)
 * @returns {Promise<any>} - JSON response
 */
async function api(endpoint, body, options = {}) {
  const isFormData = body instanceof FormData;
  
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
}

export { api, API_BASE };
