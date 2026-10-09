const configuredBase = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
).replace(/\/+$/, "");

// Accept either an API origin or a base already ending in /api. This keeps the
// public deployment variable intuitive without duplicating /api in requests.
export const apiBaseUrl = /\/api$/i.test(configuredBase)
  ? configuredBase
  : `${configuredBase}/api`;

export const apiOrigin = (() => {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return apiBaseUrl.replace(/\/api$/i, "");
  }
})();

