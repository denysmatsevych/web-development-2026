export function initDeck(): void {
  const deck = document.querySelector<HTMLElement>('#deck');
  const slides = Array.from(document.querySelectorAll<HTMLElement>('.slide'));
  if (!deck || slides.length === 0) return;

  const counter = document.querySelector<HTMLElement>('#slide-counter');
  const progress = document.querySelector<HTMLElement>('#slide-progress');
  const track = document.querySelector<HTMLElement>('#progress-track');
  const btnPrev = document.querySelector<HTMLButtonElement>('#btn-prev');
  const btnNext = document.querySelector<HTMLButtonElement>('#btn-next');

  let current = 0;

  function goTo(index: number, options: { focus?: boolean; instant?: boolean } = {}): void {
    const target = Math.min(Math.max(index, 0), slides.length - 1);
    slides[target].scrollIntoView({
      behavior: options.instant ? 'auto' : 'smooth',
      inline: 'start',
      block: 'nearest',
    });
    if (options.focus) slides[target].focus({ preventScroll: true });
  }

  function render(): void {
    const human = current + 1;

    if (counter) counter.textContent = `${human} / ${slides.length}`;

    if (progress) progress.style.width = `${(human / slides.length) * 100}%`;
    track?.setAttribute('aria-valuenow', String(human));

    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === slides.length - 1;

    const id = slides[current].id;
    if (id) history.replaceState(null, '', `#${id}`);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          current = slides.indexOf(entry.target as HTMLElement);
          render();
        }
      }
    },
    { root: deck, threshold: [0.6] },
  );
  slides.forEach((slide) => observer.observe(slide));

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        event.preventDefault();
        goTo(current + 1, { focus: true });
        return;
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault();
        goTo(current - 1, { focus: true });
        return;
      case 'Home':
        event.preventDefault();
        goTo(0, { focus: true });
        return;
      case 'End':
        event.preventDefault();
        goTo(slides.length - 1, { focus: true });
        return;
    }

    switch (event.code) {
      case 'KeyN':
        document.body.classList.toggle('show-notes');
        return;
      case 'KeyF':
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen();
        return;
      case 'KeyT': {
        const root = document.documentElement;
        const isLight = root.classList.toggle('theme-light');
        localStorage.setItem('deck-theme', isLight ? 'light' : 'dark');
        return;
      }
    }
  });

  btnPrev?.addEventListener('click', () => goTo(current - 1, { focus: true }));
  btnNext?.addEventListener('click', () => goTo(current + 1, { focus: true }));

  const fromHash = slides.findIndex((slide) => `#${slide.id}` === window.location.hash);
  if (fromHash > 0) goTo(fromHash, { instant: true });

  render();
}
