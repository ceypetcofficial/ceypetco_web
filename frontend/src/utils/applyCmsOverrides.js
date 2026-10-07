import DOMPurify from 'dompurify';

const SKIP_CLASSES = new Set(["home-services-grid", "directory-grid"]);

const SETTLE_FRAMES = 4;

const stripEditorArtifacts = (node) => {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
  node.removeAttribute("contenteditable");
  node.removeAttribute("spellcheck");
  for (const attr of [...node.attributes]) {
    if (attr.name.startsWith("data-cms-") || attr.name.startsWith("data-visual-")) {
      node.removeAttribute(attr.name);
    }
  }
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
};

DOMPurify.addHook("afterSanitizeAttributes", stripEditorArtifacts);

const ownedNodes = new WeakMap();

const appliedMarkup = new WeakMap();

const sanitize = (html) => DOMPurify.sanitize(html == null ? '' : String(html), {
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'base'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'javascript'],
  ADD_ATTR: ['target'],  // allow target for links
});

const normalizeHtml = (html) => {
  const template = document.createElement("template");
  template.innerHTML = sanitize(html);
  return template.innerHTML;
};

const buildNodes = (html) => {
  const template = document.createElement("template");
  template.innerHTML = sanitize(html);
  return [...template.content.childNodes];
};

const textNodesOf = (element) => {
  const texts = [];
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) texts.push(node);
  }
  return texts;
};

const hasForeignElements = (element) => {
  const owned = ownedNodes.get(element) || [];
  for (const node of element.childNodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    if (!owned.includes(node)) return true;
  }
  return false;
};

const isTextOnlyHtml = (html) => {
  const probe = document.createElement("div");
  probe.innerHTML = sanitize(html);
  return !probe.querySelector("*");
};

const clearOwnedNodes = (element) => {
  const owned = ownedNodes.get(element);
  if (!owned) return;
  for (const node of owned) {
    if (node.parentNode === element) element.removeChild(node);
  }
  ownedNodes.set(element, []);
};

const blankForeignText = (element) => {
  for (const node of textNodesOf(element)) node.nodeValue = "";
};

const isSkipped = (element) => {
  for (const name of SKIP_CLASSES) {
    if (element.classList.contains(name)) return true;
  }
  return false;
};

const writeText = (element, value) => {
  const texts = textNodesOf(element);
  if (!texts.length) {
    element.appendChild(document.createTextNode(value));
    return;
  }
  texts[0].nodeValue = value;
  for (let index = 1; index < texts.length; index += 1) texts[index].nodeValue = "";
};

const writeInlineMarkup = (element, html) => {
  clearOwnedNodes(element);
  blankForeignText(element);
  const owned = [];
  for (const node of buildNodes(html)) {
    element.appendChild(node);
    owned.push(node);
  }
  ownedNodes.set(element, owned);
};

const writeMarkup = (element, html) => {
  clearOwnedNodes(element);
  element.innerHTML = sanitize(html);
};

const applyEntry = (root, entry) => {
  if (!entry || typeof entry.selector !== "string" || !entry.selector) return;
  const next = entry.html == null ? "" : String(entry.html);
  let element = null;
  try {
    element = root.querySelector(entry.selector);
  } catch {
    return;
  }
  if (!element || !element.isConnected || isSkipped(element)) return;
  const textOnlyHtml = isTextOnlyHtml(next);
  if (!hasForeignElements(element)) {
    if (textOnlyHtml) {
      clearOwnedNodes(element);
      writeText(element, next);
    } else {
      writeInlineMarkup(element, next);
    }
    return;
  }
  if (appliedMarkup.get(element) === next) return;
  if (normalizeHtml(element.innerHTML) === normalizeHtml(next)) {
    appliedMarkup.set(element, next);
    return;
  }
  writeMarkup(element, next);
  appliedMarkup.set(element, next);
};

export default function applyCmsOverrides(overrides, root = document) {
  if (!Array.isArray(overrides) || overrides.length === 0) return;
  for (const entry of overrides) applyEntry(root, entry);
}

export function scheduleCmsOverrides(overrides, root = document) {
  if (!Array.isArray(overrides) || overrides.length === 0) return undefined;
  let cancelled = false;
  const settle = (remaining) => {
    window.requestAnimationFrame(() => {
      if (cancelled) return;
      applyCmsOverrides(overrides, root);
      if (remaining > 0) settle(remaining - 1);
    });
  };
  applyCmsOverrides(overrides, root);
  settle(SETTLE_FRAMES);
  return () => {
    cancelled = true;
  };
}
