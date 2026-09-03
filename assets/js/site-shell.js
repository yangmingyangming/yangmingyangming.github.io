(() => {
  const projects = [
    { slug: 'wisp', title: '浮愿 WiSP', href: 'wisp.html', cover: '../assets/images/optimized/wisp-cover.webp' },
    { slug: 'xigua', title: 'RE:GROUND', href: 'xigua.html', cover: '../assets/images/optimized/xigua-cover.webp' },
    { slug: 'brand-design', title: 'EVERLIFE', href: 'brand-design.html', cover: '../assets/images/optimized/brand-cover.webp' },
    { slug: 'business-internship', title: '商业实习项目', href: 'business-internship.html', cover: '../assets/images/optimized/internship-cover.webp' },
    { slug: 'aya-game', title: 'AYA / 阿娅', href: 'aya-game.html', cover: '../assets/images/optimized/aya-cover.webp' }
  ];

  function initDetailShell() {
    const page = document.querySelector('.page');
    if (!page || document.body.classList.contains('home-page')) return;
    const current = location.pathname.split('/').pop().replace('.html', '');
    const index = projects.findIndex((project) => project.slug === current);
    if (index < 0) return;
    const toolbar = document.querySelector('.floating-toolbar');
    if (toolbar) {
      toolbar.className = 'floating-toolbar editorial-detail-nav';
      toolbar.innerHTML = `<a class="detail-nav-brand" href="../index.html#projects"><span>杨茗 / WORKS</span></a><span class="detail-nav-title">${String(index + 1).padStart(2, '0')} / ${projects[index].title}</span><a class="detail-nav-back" href="../index.html#projects">全部作品 ↗</a>`;
    }
    page.querySelectorAll('h2, h3').forEach((heading, headingIndex) => {
      if (!heading.id) heading.id = `section-${headingIndex + 1}`;
    });
    const heroSummary = page.querySelector('.hero-summary');
    if (heroSummary && !page.querySelector('.detail-hero-media')) {
      const cover = document.createElement('figure');
      cover.className = 'detail-hero-media';
      cover.innerHTML = `<img src="${projects[index].cover}" alt="${projects[index].title} 项目封面" fetchpriority="high"><figcaption>${String(index + 1).padStart(2, '0')} / Selected project</figcaption>`;
      heroSummary.insertAdjacentElement('afterend', cover);
    }
    const headings = [...page.querySelectorAll('h2[id]')];
    if (headings.length > 1 && !page.querySelector('.detail-index')) {
      const indexNav = document.createElement('nav');
      indexNav.className = 'detail-index';
      indexNav.setAttribute('aria-label', '项目章节');
      indexNav.innerHTML = headings.map((heading, headingIndex) => `<a href="#${heading.id}">${String(headingIndex + 1).padStart(2, '0')} ${heading.textContent.trim()}</a>`).join('');
      (heroSummary || page.querySelector('.hero')).insertAdjacentElement('afterend', indexNav);
    }
    const footer = document.createElement('nav');
    footer.className = 'project-next-nav';
    const previous = projects[(index - 1 + projects.length) % projects.length];
    const next = projects[(index + 1) % projects.length];
    footer.innerHTML = `<a href="${previous.href}"><span>Previous</span><strong>${previous.title} ↖</strong></a><a href="${next.href}"><span>Next project</span><strong>${next.title} ↗</strong></a>`;
    const footerNote = page.querySelector('.footer-note');
    page.insertBefore(footer, footerNote || null);
  }

  window.SiteShell = {
    initDetailShell,
    initThemeToggle() {},
    initFloatingToolbar(selector = '.floating-toolbar') {
      const toolbar = document.querySelector(selector);
      if (toolbar) toolbar.classList.add('is-expanded');
    }
  };
  document.addEventListener('DOMContentLoaded', initDetailShell);
})();
