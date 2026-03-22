const FALLBACK_MEDIA_SRC = 'assets/images/projects/placeholder-media.svg';

function replaceImageSource(image, fallbackSrc = FALLBACK_MEDIA_SRC) {
  if (!image || image.dataset.fallbackApplied === 'true') {
    return;
  }

  image.dataset.fallbackApplied = 'true';
  image.src = fallbackSrc;
}

function replaceVideoWithFallback(video) {
  if (!video || video.dataset.fallbackApplied === 'true') {
    return;
  }

  video.dataset.fallbackApplied = 'true';

  const fallbackImage = document.createElement('img');
  fallbackImage.className = video.className;
  fallbackImage.src = FALLBACK_MEDIA_SRC;
  fallbackImage.alt = video.dataset.fallbackAlt || '项目媒体占位图';
  fallbackImage.loading = 'lazy';

  fallbackImage.addEventListener('error', () => {
    fallbackImage.removeAttribute('src');
  }, { once: true });

  video.replaceWith(fallbackImage);
}

function bindMediaFallbacks() {
  const projectImages = document.querySelectorAll('.project-media-wrap img.project-media');
  const projectVideos = document.querySelectorAll('.project-media-wrap video.project-media');
  const fallbackImages = document.querySelectorAll('img[data-fallback-src]');

  projectImages.forEach((image) => {
    image.addEventListener('error', () => replaceImageSource(image), { once: true });
  });

  fallbackImages.forEach((image) => {
    const fallbackSrc = image.dataset.fallbackSrc;
    image.addEventListener('error', () => replaceImageSource(image, fallbackSrc), { once: true });
  });

  projectVideos.forEach((video) => {
    const handleVideoFailure = () => replaceVideoWithFallback(video);

    video.addEventListener('error', handleVideoFailure, { once: true });
    video.querySelectorAll('source').forEach((source) => {
      source.addEventListener('error', handleVideoFailure, { once: true });
    });
  });
}

function bindHomeHeaderMotion() {
  const header = document.querySelector('.site-header');
  if (!header) {
    return;
  }

  let ticking = false;

  const updateHeaderState = () => {
    header.classList.toggle('is-nav-expanded', window.scrollY > 24);
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateHeaderState);
  };

  updateHeaderState();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function bindMobileNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const backdrop = document.querySelector('.nav-backdrop');

  if (!header || !toggle || !navLinks || !backdrop) {
    return;
  }

  const navLinkItems = Array.from(navLinks.querySelectorAll('a'));

  const closeMenu = () => {
    if (!header.classList.contains('is-menu-open')) {
      return;
    }

    header.classList.remove('is-menu-open');
    document.body.classList.remove('is-nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '打开导航菜单');
  };

  const openMenu = () => {
    header.classList.add('is-menu-open');
    document.body.classList.add('is-nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '关闭导航菜单');
  };

  const syncMenuStateByWidth = () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  };

  toggle.addEventListener('click', () => {
    if (header.classList.contains('is-menu-open')) {
      closeMenu();
      return;
    }

    openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  navLinkItems.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', syncMenuStateByWidth);
  syncMenuStateByWidth();
}

function bindSectionNavigationEffects() {
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (!navLinks.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = navLinks
    .map((link) => {
      const targetId = link.getAttribute('href')?.slice(1);
      if (!targetId) {
        return null;
      }

      return document.getElementById(targetId);
    })
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const seen = new Set();
  const uniqueSections = sections.filter((section) => {
    if (seen.has(section.id)) {
      return false;
    }

    seen.add(section.id);
    return true;
  });

  const setActiveLink = (activeId) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + activeId;
      link.classList.toggle('is-active', isActive);
    });
  };

  if (!prefersReducedMotion) {
    uniqueSections.forEach((section) => {
      section.classList.add('reveal-section');
    });

    requestAnimationFrame(() => {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
      });

      uniqueSections.forEach((section) => revealObserver.observe(section));
    });
  }

  const syncActiveByScroll = () => {
    const lastSection = uniqueSections[uniqueSections.length - 1];
    const scrollBottom = window.scrollY + window.innerHeight;
    const maxScrollBottom = document.documentElement.scrollHeight;

    if (lastSection && maxScrollBottom - scrollBottom <= 24) {
      setActiveLink(lastSection.id);
      return;
    }

    const marker = window.innerHeight * 0.34;
    let current = null;

    uniqueSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker) {
        current = section;
      }
    });

    if (current) {
      setActiveLink(current.id);
      return;
    }

    navLinks.forEach((link) => link.classList.remove('is-active'));
  };

  let ticking = false;
  const onScrollOrResize = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      syncActiveByScroll();
      ticking = false;
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      link.classList.add('is-clicked');
      window.setTimeout(() => link.classList.remove('is-clicked'), 280);

      if (prefersReducedMotion) {
        return;
      }

      const targetId = link.getAttribute('href')?.slice(1);
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) {
        return;
      }

      window.setTimeout(() => {
        target.classList.add('section-focus-pop');
        window.setTimeout(() => target.classList.remove('section-focus-pop'), 800);
      }, 380);
    });
  });

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
  syncActiveByScroll();
}

function bindSkillsInteractions() {
  const skillSection = document.getElementById('practice');
  if (!skillSection) {
    return;
  }

  const chips = Array.from(skillSection.querySelectorAll('.skill-chip'));
  if (!chips.length) {
    return;
  }

  chips.forEach((chip, index) => {
    chip.classList.add('chip-reveal');
    chip.style.setProperty('--chip-index', String(index));
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add('is-chip-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -5% 0px'
  });

  chips.forEach((chip) => revealObserver.observe(chip));
}

function bindHomepageBackgroundEffects() {
  const bgLayer = document.querySelector('.site-bg-effects');
  if (!bgLayer) {
    return;
  }

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canUseFinePointer = window.matchMedia('(pointer: fine)').matches;
  const isSmallViewport = window.innerWidth < 980;

  if (prefersReducedMotion || isSmallViewport) {
    root.classList.add('is-mobile-effects-reduced');
  }

  const updateScrollProgress = () => {
    const doc = document.documentElement;
    const total = Math.max(1, doc.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / total));
    root.style.setProperty('--bg-scroll', progress.toFixed(4));
  };

  let rafId = 0;
  let targetX = 50;
  let targetY = 28;
  let currentX = 50;
  let currentY = 28;

  const animatePointer = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    root.style.setProperty('--bg-pointer-x', currentX.toFixed(2) + '%');
    root.style.setProperty('--bg-pointer-y', currentY.toFixed(2) + '%');

    if (Math.abs(targetX - currentX) > 0.06 || Math.abs(targetY - currentY) > 0.06) {
      rafId = window.requestAnimationFrame(animatePointer);
    } else {
      rafId = 0;
    }
  };

  const handleMouseMove = (event) => {
    targetX = (event.clientX / window.innerWidth) * 100;
    targetY = (event.clientY / window.innerHeight) * 100;

    if (!rafId) {
      rafId = window.requestAnimationFrame(animatePointer);
    }
  };

  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  if (!prefersReducedMotion && canUseFinePointer && !isSmallViewport) {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
  }
}

function initSite() {
  if (window.SiteShell) {
    window.SiteShell.initThemeToggle();
  }
  bindMediaFallbacks();
  bindHomeHeaderMotion();
  bindMobileNavigation();
  bindSectionNavigationEffects();
  bindSkillsInteractions();
  bindHomepageBackgroundEffects();
}

document.addEventListener('DOMContentLoaded', initSite);
