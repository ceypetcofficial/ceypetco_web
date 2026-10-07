const URL_FIELD = /(url|uri|href|link|website|documents?|images?|photo|icon|file|tds|msds)$/i;
const DANGEROUS_SCHEME = /^\s*(?:javascript|vbscript|data|file|blob):/i;

const escapeRegex = (value, maxLength = 100) =>
  String(value || "")
    .slice(0, maxLength)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isSafeWebUrl = (value, { allowRelative = true } = {}) => {
  if (typeof value !== "string" || !value.trim() || /[\u0000-\u001f\u007f]/.test(value)) return false;
  const input = value.trim();
  if (allowRelative && input.startsWith("/") && !input.startsWith("//")) return true;
  if (allowRelative && /^(?:[A-Za-z0-9._~-][A-Za-z0-9._~/?#%=&+-]*|#[A-Za-z0-9_-]+)$/.test(input) && !input.includes("..")) return true;
  try {
    const parsed = new URL(input);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const findUnsafeUrl = (value, key = "", depth = 0) => {
  if (depth > 8) return "Payload nesting is too deep";
  if (Array.isArray(value)) {
    for (const entry of value) {
      const error = findUnsafeUrl(entry, key, depth + 1);
      if (error) return error;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      if (["__proto__", "prototype", "constructor"].includes(childKey)) return "Invalid object field";
      const error = findUnsafeUrl(childValue, childKey, depth + 1);
      if (error) return error;
    }
    return null;
  }
  if (typeof value === "string" && URL_FIELD.test(key)) {
    const input = value.trim();
    if (input && (DANGEROUS_SCHEME.test(input) || (!isSafeWebUrl(input) && !/^(?:mailto|tel):[^\s]+$/i.test(input)))) {
      return `Unsafe URL in ${key}`;
    }
  }
  return null;
};

module.exports = { escapeRegex, findUnsafeUrl, isSafeWebUrl };
