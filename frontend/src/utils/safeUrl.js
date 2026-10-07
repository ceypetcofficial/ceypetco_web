export default function safeUrl(value, fallback = "#") {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const input = value.trim();
  if (input.startsWith("/") && !input.startsWith("//")) return input;
  if (/^(?:[A-Za-z0-9._~-][A-Za-z0-9._~/?#%=&+-]*|#[A-Za-z0-9_-]+)$/.test(input) && !input.includes("..")) return input;
  if (/^(?:mailto|tel):[^\s]+$/i.test(input)) return input;
  try {
    const parsed = new URL(input);
    return ["http:", "https:"].includes(parsed.protocol) ? input : fallback;
  } catch {
    return fallback;
  }
}
