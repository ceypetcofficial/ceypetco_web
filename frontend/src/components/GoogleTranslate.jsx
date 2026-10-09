import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const SCRIPT_ID = "google-translate-script";
const CALLBACK_NAME = "ceypetcoGoogleTranslateInit";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", native: "English" },
  { code: "si", label: "Sinhala", native: "සිංහල" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
];

const LANGUAGE_BUTTON_LABEL = {
  en: "English",
  si: "සිංහල",
  ta: "தமிழ்",
};

const isSupportedLanguage = (code) => LANGUAGE_OPTIONS.some((option) => option.code === code);

const getInitialLanguage = () => {
  const translationCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("googtrans="));
  let cookieLanguage = null;
  if (translationCookie) {
    try {
      cookieLanguage = decodeURIComponent(translationCookie.slice("googtrans=".length)).split("/").at(-1);
    } catch {
      // Ignore malformed cookies and use the saved preference instead.
    }
  }
  if (isSupportedLanguage(cookieLanguage)) return cookieLanguage;

  const savedLanguage = localStorage.getItem("ceypetco_google_language");
  return isSupportedLanguage(savedLanguage) ? savedLanguage : "en";
};

const GoogleTranslate = () => {
  const { setLanguage } = useLanguage();
  const [selected, setSelected] = useState(getInitialLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const selectedRef = useRef(selected);
  const containerRef = useRef(null);
  const widgetSelectRef = useRef(null);
  const widgetChangeHandlerRef = useRef(null);

  useEffect(() => {
    document.documentElement.lang = selected;
    document.documentElement.classList.toggle(
      "ceypetco-translated",
      selected !== "en",
    );
  }, [selected]);

  const watchWidgetSelect = (select) => {
    if (widgetSelectRef.current === select) return;
    widgetSelectRef.current?.removeEventListener("change", widgetChangeHandlerRef.current);
    const handleChange = () => {
      if (!isSupportedLanguage(select.value)) return;
      selectedRef.current = select.value;
      setSelected(select.value);
      localStorage.setItem("ceypetco_google_language", select.value);
    };
    select.addEventListener("change", handleChange);
    widgetSelectRef.current = select;
    widgetChangeHandlerRef.current = handleChange;
  };

  const applyLanguage = (language, attempts = 0) => {
    const select = document.querySelector(".goog-te-combo");
    if (!select) {
      if (attempts < 80) {
        window.setTimeout(() => applyLanguage(language, attempts + 1), 250);
      }
      return;
    }
    watchWidgetSelect(select);
    if (language === "en" && !select.querySelector('option[value="en"]')) {
      const hadTranslationCookie = document.cookie.split("; ").some((cookie) => cookie.startsWith("googtrans="));
      document.cookie = "googtrans=; Max-Age=0; path=/";
      document.cookie = `googtrans=; Max-Age=0; path=/; domain=.${window.location.hostname}`;
      if (hadTranslationCookie) window.location.reload();
      return;
    }
    select.value = language;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    window.setTimeout(() => {
      const retrySelect = document.querySelector(".goog-te-combo");
      if (retrySelect && retrySelect.value === language) return;
      if (retrySelect) {
        retrySelect.value = language;
        retrySelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, 700);
  };

  useEffect(() => {
    setLanguage("en");
    const initialize = () => {
      if (!window.google?.translate?.TranslateElement) return;
      const host = document.getElementById("google_translate_element");
      if (!host) return;
      if (host.childElementCount && document.querySelector(".goog-te-combo")) {
        applyLanguage(selectedRef.current);
        return;
      }
      if (host.childElementCount) host.replaceChildren();
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "auto",
          includedLanguages: "en,si,ta",
          multilanguagePage: true,
          autoDisplay: false,
        },
        "google_translate_element",
      );
      applyLanguage(selectedRef.current);
    };
    window[CALLBACK_NAME] = initialize;
    if (window.google?.translate?.TranslateElement) initialize();
    else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://translate.google.com/translate_a/element.js?cb=${CALLBACK_NAME}`;
      script.async = true;
      document.head.appendChild(script);
    }
    return () => {
      widgetSelectRef.current?.removeEventListener("change", widgetChangeHandlerRef.current);
      widgetSelectRef.current = null;
    };
  }, [setLanguage]);

  useEffect(() => {
    const CLEANUP_STYLE_ID = "ceypetco-google-cleanup";

    const injectCleanupStyles = () => {
      if (document.getElementById(CLEANUP_STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = CLEANUP_STYLE_ID;
      style.textContent = [
        "body { top: 0px !important; margin-top: 0px !important; }",
        "html { min-height: 0px !important; }",
        "iframe.goog-te-banner-frame, .goog-te-banner-frame, .goog-te-banner-frame.skiptranslate, body > iframe.goog-te-banner-frame { display: none !important; visibility: hidden !important; height: 0 !important; border: 0 !important; margin: 0 !important; padding: 0 !important; }",
        "iframe.goog-te-balloon-frame, .goog-te-balloon-frame, .goog-te-spinner-pos, .goog-te-spinner { display: none !important; visibility: hidden !important; }",
        "#goog-gt-tt { display: none !important; visibility: hidden !important; }",
        "body > div.skiptranslate { display: none !important; visibility: hidden !important; }",
        ".google-translate-engine, #google_translate_element, .goog-te-gadget, .goog-te-gadget-simple, .goog-te-gadget-icon, .VIpgJd-ZVi9od-xl07Ob-lTBxed, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf { position: fixed !important; top: -10000px !important; left: -10000px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }",
        ".goog-te-combo { position: fixed !important; top: -2000px !important; left: -2000px !important; width: 2px !important; height: 2px !important; opacity: 0 !important; pointer-events: none !important; }",
      ].join("");
      document.head.appendChild(style);
    };
    injectCleanupStyles();

    const cleanupGoogleChrome = () => {
      const body = document.body;
      if (body.style.position) body.style.removeProperty("position");
      if (body.style.top !== "0px") body.style.top = "0px";
      if (body.style.marginTop !== "0px") body.style.marginTop = "0px";
    };

    cleanupGoogleChrome();
    const sweepTimer = window.setInterval(cleanupGoogleChrome, 250);
    const timers = [400, 1200, 3000].map((ms) =>
      window.setTimeout(cleanupGoogleChrome, ms),
    );
    if (!window.MutationObserver) {
      return () => {
        window.clearInterval(sweepTimer);
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }
    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(cleanupGoogleChrome);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => {
      window.clearInterval(sweepTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const changeLanguage = (value) => {
    selectedRef.current = value;
    setSelected(value);
    setIsOpen(false);
    localStorage.setItem("ceypetco_google_language", value);
    applyLanguage(value);
  };

  return (
    <>
      <div
        className={`site-language notranslate ${isOpen ? "open" : ""}`}
        ref={containerRef}
        translate="no"
      >
        <button
          type="button"
          className="site-language-trigger notranslate"
          translate="no"
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Website language"
        >
          <span className="site-language-code notranslate" translate="no">
            {LANGUAGE_BUTTON_LABEL[selected] ?? "EN"}
          </span>
          <svg
            className={`site-language-chevron notranslate ${isOpen ? "open" : ""}`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <div
          className="site-language-menu notranslate"
          role="listbox"
          aria-label="Website language"
          translate="no"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              role="option"
              aria-selected={option.code === selected}
              className={`site-language-option notranslate ${option.code === selected ? "active" : ""}`}
              translate="no"
              onClick={() => changeLanguage(option.code)}
            >
              <span className="site-language-option-copy notranslate" translate="no">
                <b className="notranslate" translate="no">{option.native}</b>
                <small className="notranslate" translate="no">{option.label}</small>
              </span>
              {option.code === selected && (
                <svg
                  className="site-language-check notranslate"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="google-translate-engine" aria-hidden="true">
        <div id="google_translate_element" />
      </div>
    </>
  );
};

export default GoogleTranslate;
