(() => {
  if (window.matchMedia('(pointer: fine)').matches === false || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest('a, button, summary');
    if (target) document.documentElement.dataset.pointerState = 'hover';
  });
  document.addEventListener('pointerout', (event) => {
    if (event.target.closest('a, button, summary')) document.documentElement.dataset.pointerState = 'idle';
  });
})();
