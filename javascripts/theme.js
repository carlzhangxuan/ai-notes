// Site-wide color scheme management for static export pages.
// Keeps Material's "default/slate" scheme in sync and adds a header toggle.
(function () {
  const STORAGE_KEY = "ai-notes-theme";
  const DARK_QUERY = "(prefers-color-scheme: dark)";
  const THEME_LIGHT = "light";
  const THEME_DARK = "dark";
  const TOGGLE_ID = "ai-notes-theme-toggle";
  const STYLE_ID = "ai-notes-theme-style";

  function hasStoredPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (_err) {
      return false;
    }
  }

  function getStoredTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value === THEME_LIGHT || value === THEME_DARK) return value;
      return null;
    } catch (_err) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_err) {
      // Ignore quota/privacy failures.
    }
  }

  function removeStoredTheme() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_err) {
      // Ignore quota/privacy failures.
    }
  }

  function getSystemTheme() {
    if (!window.matchMedia) return THEME_LIGHT;
    return window.matchMedia(DARK_QUERY).matches ? THEME_DARK : THEME_LIGHT;
  }

  function asScheme(theme) {
    return theme === THEME_DARK ? "slate" : "default";
  }

  function asMedia(theme) {
    return theme === THEME_DARK ? DARK_QUERY : "(prefers-color-scheme: light)";
  }

  function persistMaterialPalette(theme) {
    if (typeof __md_set === "function") {
      __md_set("__palette", {
        color: {
          media: asMedia(theme),
          scheme: asScheme(theme),
          primary: "indigo",
          accent: "indigo",
        },
      });
    }
  }

  function applyTheme(theme) {
    const scheme = asScheme(theme);
    document.body.setAttribute("data-md-color-scheme", scheme);
    document.body.setAttribute("data-md-color-primary", "indigo");
    document.body.setAttribute("data-md-color-accent", "indigo");
    document.body.setAttribute("data-md-color-media", asMedia(theme));
    document.documentElement.style.colorScheme = theme;
    persistMaterialPalette(theme);
    updateToggle(theme);
  }

  function resolveTheme() {
    return getStoredTheme() || THEME_DARK;
  }

  function mountStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${TOGGLE_ID} .theme-icon-sun,
      #${TOGGLE_ID} .theme-icon-moon { display: none; }
      body[data-md-color-scheme="default"] #${TOGGLE_ID} .theme-icon-moon { display: inline-block; }
      body[data-md-color-scheme="slate"] #${TOGGLE_ID} .theme-icon-sun { display: inline-block; }
      #${TOGGLE_ID} svg { width: 1.2rem; height: 1.2rem; }
    `;
    document.head.appendChild(style);
  }

  function moonIcon() {
    return '<svg class="theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.74 2a9.99 9.99 0 0 0-2.36 19.72 10 10 0 0 0 11.23-13.5 8 8 0 0 1-8.87-6.22A8 8 0 0 1 12.74 2Z"/></svg>';
  }

  function sunIcon() {
    return '<svg class="theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm0-6 1.8 2.7L17 3.9l-.7 3.2L19 9l-3.2.7L17 13l-3.2-.8L12 15l-1.8-2.8L7 13l1.2-3.3L5 9l2.7-1.9L7 3.9l3.2.8Z"/></svg>';
  }

  function ensureToggleButton() {
    if (document.getElementById(TOGGLE_ID)) return;
    const headerInner = document.querySelector(".md-header__inner");
    if (!headerInner) return;

    const button = document.createElement("button");
    button.id = TOGGLE_ID;
    button.className = "md-header__button md-icon";
    button.type = "button";
    button.title = "Toggle color theme";
    button.setAttribute("aria-label", "Toggle color theme");
    button.innerHTML = `${moonIcon()}${sunIcon()}`;
    button.addEventListener("click", function () {
      const currentScheme = document.body.getAttribute("data-md-color-scheme");
      const nextTheme = currentScheme === "slate" ? THEME_LIGHT : THEME_DARK;
      setStoredTheme(nextTheme);
      applyTheme(nextTheme);
    });

    const searchButton = headerInner.querySelector('label[for="__search"]');
    if (searchButton) {
      headerInner.insertBefore(button, searchButton);
    } else {
      headerInner.appendChild(button);
    }
  }

  function updateToggle(theme) {
    const button = document.getElementById(TOGGLE_ID);
    if (!button) return;
    const nextMode = theme === THEME_DARK ? "light" : "dark";
    button.title = `Switch to ${nextMode} mode`;
    button.setAttribute("aria-label", `Switch to ${nextMode} mode`);
  }

  function bootstrapTheme() {
    if (!hasStoredPreference()) {
      setStoredTheme(THEME_DARK);
    }
    mountStyle();
    ensureToggleButton();
    applyTheme(resolveTheme());
  }

  function onPageChange(callback) {
    if (typeof window.document$ !== "undefined" && typeof window.document$.subscribe === "function") {
      window.document$.subscribe(callback);
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  }

  // Follow system theme only when the user hasn't explicitly chosen one.
  if (window.matchMedia) {
    const media = window.matchMedia(DARK_QUERY);
    const onMediaChange = function () {
      if (!hasStoredPreference()) applyTheme(getSystemTheme());
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onMediaChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(onMediaChange);
    }
  }

  // Optional reset hook in devtools: window.__aiResetTheme()
  window.__aiResetTheme = function () {
    removeStoredTheme();
    applyTheme(getSystemTheme());
  };

  onPageChange(() => {
    bootstrapTheme();
  });
})();
