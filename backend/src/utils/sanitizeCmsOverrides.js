const sanitizeHtml = require("sanitize-html");

const MAX_OVERRIDES = 500;
const MAX_HTML_LENGTH = 100000;
const SAFE_SELECTOR = /^main(?:>[a-z][a-z0-9-]*:nth-of-type\([1-9][0-9]*\))*$/i;

const sanitizeMarkup = (value) =>
  sanitizeHtml(String(value ?? "").slice(0, MAX_HTML_LENGTH), {
    allowedTags: [
      "a", "abbr", "article", "aside", "b", "blockquote", "br", "button",
      "caption", "cite", "code", "col", "colgroup", "dd", "del", "details",
      "div", "dl", "dt", "em", "figcaption", "figure", "h1", "h2", "h3",
      "h4", "h5", "h6", "hr", "i", "img", "ins", "kbd", "li", "mark",
      "ol", "p", "picture", "pre", "q", "s", "section", "small", "source",
      "span", "strong", "sub", "summary", "sup", "table", "tbody", "td",
      "tfoot", "th", "thead", "time", "tr", "u", "ul",
    ],
    allowedAttributes: {
      "*": ["class", "id", "title", "role", "aria-*"],
      a: ["href", "target", "rel"],
      button: ["type", "disabled"],
      img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"],
      source: ["src", "srcset", "sizes", "type", "media"],
      td: ["colspan", "rowspan", "headers"],
      th: ["colspan", "rowspan", "headers", "scope"],
      time: ["datetime"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
      source: ["http", "https"],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: attribs.target === "_blank"
          ? { ...attribs, rel: "noopener noreferrer" }
          : attribs,
      }),
    },
  });

const sanitizeCmsOverrides = (overrides) => {
  if (!Array.isArray(overrides)) return [];
  return overrides.slice(0, MAX_OVERRIDES).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const selector = typeof entry.selector === "string" ? entry.selector.trim() : "";
    if (!SAFE_SELECTOR.test(selector)) return [];
    return [{ selector, html: sanitizeMarkup(entry.html) }];
  });
};

module.exports = { sanitizeCmsOverrides, sanitizeMarkup };
