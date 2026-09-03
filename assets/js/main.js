(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  function bindMediaFallbacks() {
    document.querySelectorAll('img[data-fallback-src]').forEach((image) => {
      image.addEventListener('error', () => {
        if (image.dataset.fallbackApplied === 'true') return;
        image.dataset.fallbackApplied = 'true';
        image.src = image.dataset.fallbackSrc;
      }, { once: true });
    });
  }

  function bindMobileNavigation() {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.nav-menu-toggle');
    const backdrop = document.querySelector('.nav-backdrop');
    if (!header || !toggle) return;
    const close = () => {
      header.classList.remove('is-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '打开导航菜单');
    };
    toggle.addEventListener('click', () => {
      const open = !header.classList.contains('is-menu-open');
      header.classList.toggle('is-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    });
    backdrop?.addEventListener('click', close);
    document.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', close));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  }

  function bindReveals() {
    const items = [...document.querySelectorAll('.reveal-item')];
    if (!reducedMotion) document.body.classList.add('motion-ready');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: .14, rootMargin: '0px 0px -8% 0px' });
    items.forEach((item, index) => { item.style.transitionDelay = `${Math.min(index * 35, 240)}ms`; observer.observe(item); });
  }

  function bindSectionState() {
    const sections = [...document.querySelectorAll('main > section[id]')];
    const label = document.querySelector('.nav-current-section');
    const links = [...document.querySelectorAll('.nav-links a')];
    const sectionNames = { hero: 'intro', projects: 'work', about: 'about', experience: 'internship', practice: 'campus', contact: 'contact' };
    if (!sections.length || !label) return;
    const sync = () => {
      const marker = window.innerHeight * .32;
      let current = sections[0];
      sections.forEach((section) => { if (section.getBoundingClientRect().top <= marker) current = section; });
      const index = sections.indexOf(current);
      label.textContent = `${String(index).padStart(2, '0')} / ${sectionNames[current.id] || current.id}`;
      links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${current.id}`));
    };
    let ticking = false;
    const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { sync(); ticking = false; }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    sync();
  }

  function bindParallax() {
    if (reducedMotion || !finePointer) return;
    const hero = document.querySelector('.hero-figure');
    if (!hero) return;
    const image = hero.querySelector('img');
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      image.style.transform = `translate(${x * 10}px, ${y * 10}px) scale(1.025)`;
    });
    hero.addEventListener('pointerleave', () => { image.style.transform = ''; });
  }

  function bindScrollVariable() {
    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  function bindProjectTilt() {
    if (reducedMotion || !finePointer) return;
    document.querySelectorAll('.featured-project').forEach((project) => {
      project.addEventListener('pointermove', (event) => {
        const rect = project.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        project.style.setProperty('--tilt-x', `${(x * 2.8).toFixed(2)}deg`);
        project.style.setProperty('--tilt-y', `${(-y * 2.8).toFixed(2)}deg`);
        project.style.setProperty('--pointer-x', `${((x + .5) * 100).toFixed(1)}%`);
        project.style.setProperty('--pointer-y', `${((y + .5) * 100).toFixed(1)}%`);
      });
      project.addEventListener('pointerleave', () => {
        project.style.setProperty('--tilt-x', '0deg');
        project.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  function bindMagneticLinks() {
    if (reducedMotion || !finePointer) return;
    document.querySelectorAll('.text-link, .archive-list a').forEach((link) => {
      link.addEventListener('pointermove', (event) => {
        const rect = link.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .08;
        const y = (event.clientY - rect.top - rect.height / 2) * .12;
        link.style.setProperty('--magnet-x', `${x.toFixed(2)}px`);
        link.style.setProperty('--magnet-y', `${y.toFixed(2)}px`);
      });
      link.addEventListener('pointerleave', () => {
        link.style.setProperty('--magnet-x', '0px');
        link.style.setProperty('--magnet-y', '0px');
      });
    });
  }

  function bindPageTransitions() {
    document.body.classList.add('page-enter');
    document.querySelectorAll('a[href$=".html"], a[href^="projects/"]').forEach((link) => {
      if (link.target === '_blank' || link.origin !== window.location.origin) return;
      link.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        document.body.classList.add('page-leave');
        window.setTimeout(() => { window.location.href = link.href; }, 360);
      });
    });
  }

  function bindDetailMediaReveal() {
    if (!document.body.classList.contains('home-page')) {
      const items = [...document.querySelectorAll('.detail-hero-media, .stack-gallery-image')];
      if (reducedMotion || !('IntersectionObserver' in window)) { items.forEach((item) => item.classList.add('is-visible')); return; }
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }), { threshold: .1 });
      items.forEach((item) => observer.observe(item));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindMediaFallbacks();
    bindMobileNavigation();
    bindReveals();
    bindSectionState();
    bindParallax();
    bindScrollVariable();
    bindProjectTilt();
    bindMagneticLinks();
    bindPageTransitions();
    bindDetailMediaReveal();
  });
})();
