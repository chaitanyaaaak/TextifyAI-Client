const API_BASE = "http://localhost:8000/api";

async function api(endpoint, body, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...options,
  });
  if (!res.ok) {
    let message = "API error";
    try {
      const err = await res.json();
      message = err.detail || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export { api, API_BASE };
