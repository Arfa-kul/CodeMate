// Empty base uses the Vite /api proxy during `npm run dev`.
const API_BASE = import.meta.env.VITE_API_BASE || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = data?.detail || data?.error || `Request failed (${response.status})`;
    const error = new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export const api = {
  health: () => request("/api/health"),
  chat: (body) => request("/api/chat", { method: "POST", body: JSON.stringify(body) }),
  generate: (body) => request("/api/generate", { method: "POST", body: JSON.stringify(body) }),
  debug: (body) => request("/api/debug", { method: "POST", body: JSON.stringify(body) }),
  explain: (body) => request("/api/explain", { method: "POST", body: JSON.stringify(body) }),
  refactor: (body) => request("/api/refactor", { method: "POST", body: JSON.stringify(body) }),
  tests: (body) => request("/api/tests", { method: "POST", body: JSON.stringify(body) }),
  review: (body) => request("/api/review", { method: "POST", body: JSON.stringify(body) }),
  conversations: () => request("/api/conversations"),
  conversation: (id) => request(`/api/conversations/${id}`),
  deleteConversation: (id) => request(`/api/conversations/${id}`, { method: "DELETE" }),
};

export const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
];

export const REFACTOR_GOALS = [
  { value: "readability", label: "Improve readability" },
  { value: "duplication", label: "Reduce duplication" },
  { value: "simplify_conditions", label: "Simplify conditions" },
  { value: "naming", label: "Improve naming" },
  { value: "extract_functions", label: "Extract functions" },
  { value: "performance", label: "Suggest performance improvements" },
];
