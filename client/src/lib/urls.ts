/**
 * API base URL for resolving relative paths (e.g. profile images).
 * Uses VITE_API_BASE_URL; in dev only, fallback to http://localhost:8080 when missing.
 */
function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env != null && String(env).trim() !== "") {
    return String(env).trim().replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "http://localhost:8080";
  }
  return "";
}

/**
 * Resolves a path to a full URL for API-served assets (e.g. profile images).
 * - Empty/null/whitespace => null
 * - Already absolute (http:// or https://) => return as-is
 * - Otherwise => prepend API base URL (no double slash)
 */
export function resolveApiUrl(path?: string | null): string | null {
  if (path == null || path.trim() === "") return null;
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const base = getApiBaseUrl();
  if (!base) return null;
  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}
