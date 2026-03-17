(function createSiteShell() {
  const storageKey = 'portfolio-theme';
  const themeRequestEvent = 'site-theme-request';
  const themeChangeEvent = 'site-theme-change';
  const transitionClass = 'is-theme-transitioning';

  let isThemeRequestBound = false;
  let transitionTimerId = 0;
  let transitionWash = null;

  function isValidTheme(value) {
    return value === 'dark' || value === 'light';
  }

  function readStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function ensureTransitionWash() {
    if (transitionWash || !document.body) {
      return transitionWash;
    }

    transitionWash = document.querySelector('.theme-transition-wash');
    if (transitionWash) {
      return transitionWash;
    }

    transitionWash = document.createElement('div');
    transitionWash.className = 'theme-transition-wash';
    transitionWash.setAttribute('aria-hidden', 'true');
    document.body.appendChild(transitionWash);
    return transitionWash;
  }

  function updateToggleUI(theme) {
    document.querySelectorAll('.theme-toggle').forEach((toggle) => {
      const isLight = theme === 'light';
      const icon = toggle.querySelector('.theme-toggle-icon');

      toggle.setAttribute('aria-pressed', String(isLight));
      toggle.setAttribute('aria-label', isLight ? '切换到暗色主题' : '切换到亮色主题');

      if (icon) {
        icon.textContent = isLight ? '☀' : '☾';
      }
    });
  }

  function playThemeTransition(nextTheme) {
    const root = document.documentElement;
    const wash = ensureTransitionWash();

    if (!wash || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (transitionTimerId) {
      window.clearTimeout(transitionTimerId);
      transitionTimerId = 0;
    }

    root.classList.remove('is-theme-transition-light', 'is-theme-transition-dark');
    root.classList.add(transitionClass, nextTheme === 'light' ? 'is-theme-transition-light' : 'is-theme-transition-dark');

    wash.classList.remove('is-active', 'is-light', 'is-dark');
    void wash.offsetWidth;
    wash.classList.add('is-active', nextTheme === 'light' ? 'is-light' : 'is-dark');

    transitionTimerId = window.setTimeout(() => {
      root.classList.remove(transitionClass, 'is-theme-transition-light', 'is-theme-transition-dark');
      wash.classList.remove('is-active', 'is-light', 'is-dark');
      transitionTimerId = 0;
    }, 560);
  }

  function applyTheme(theme, options = {}) {
    const root = document.documentElement;
    const { persist = false, emit = true, animate = true } = options;
    const nextTheme = isValidTheme(theme) ? theme : 'dark';

    if (animate && root.dataset.theme && root.dataset.theme !== nextTheme) {
      playThemeTransition(nextTheme);
    }

    root.dataset.theme = nextTheme;
    updateToggleUI(nextTheme);

    if (persist) {
      writeStoredTheme(nextTheme);
    }

    if (emit) {
      document.dispatchEvent(new CustomEvent(themeChangeEvent, {
        detail: { theme: nextTheme }
      }));
    }
  }

  function bindThemeRequest() {
    if (isThemeRequestBound) {
      return;
    }

    document.addEventListener(themeRequestEvent, (event) => {
      const requestedTheme = event?.detail?.theme;
      if (!isValidTheme(requestedTheme)) {
        return;
      }

      applyTheme(requestedTheme, { persist: true, emit: true });
    });

    isThemeRequestBound = true;
  }

  function initThemeToggle() {
    bindThemeRequest();

    const storedTheme = readStoredTheme();
    applyTheme(isValidTheme(storedTheme) ? storedTheme : 'dark', { emit: true, animate: false });

    document.querySelectorAll('.theme-toggle').forEach((toggle) => {
      if (toggle.dataset.themeToggleBound === 'true') {
        return;
      }

      toggle.dataset.themeToggleBound = 'true';
      toggle.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next, { persist: true, emit: true });
      });
    });
  }

  function initFloatingToolbar(selector = '.floating-toolbar', threshold = 24) {
    const toolbar = document.querySelector(selector);
    if (!toolbar || toolbar.dataset.toolbarBound === 'true') {
      return;
    }

    toolbar.dataset.toolbarBound = 'true';

    const toggleToolbar = () => {
      toolbar.classList.toggle('is-expanded', window.scrollY > threshold);
    };

    toggleToolbar();
    window.addEventListener('scroll', toggleToolbar, { passive: true });
  }

  window.SiteShell = {
    initThemeToggle,
    initFloatingToolbar
  };
})();