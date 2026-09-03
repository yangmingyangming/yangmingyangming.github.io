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
    const sectionNames = { hero: 'intro', projects: 'work', about: 'about', experience: 'experience', contact: 'contact' };
    if (!sections.length || !label) return;
    const sync = () => {
      const marker = window.innerHeight * .32;
      let current = sections[0];
      sections.forEach((section) => { if (section.getBoundingClientRect().top <= marker) current = section; });
      const index = sections.indexOf(current) + 1;
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
    if (reducedMotion) return;
    let ticking = false;
    const update = () => {
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindMediaFallbacks();
    bindMobileNavigation();
    bindReveals();
    bindSectionState();
    bindParallax();
    bindScrollVariable();
  });
})();
