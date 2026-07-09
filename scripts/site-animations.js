function animateCounter(el) {
  const raw = el.textContent.trim();
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(num) || num === 0) return;

  const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
  const suffix = raw.match(/[^0-9.]*$/)?.[0] || '';
  const core = raw.slice(prefix.length, raw.length - suffix.length);
  if (/[^0-9.]/.test(core)) return;
  const isDecimal = raw.includes('.');
  const duration = 1400;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - (1 - t) ** 3;
    const value = isDecimal ? (eased * num).toFixed(1) : Math.round(eased * num);
    el.textContent = prefix + value + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function setupCounters() {
  const counters = [
    ...document.querySelectorAll('.columns:not(.compare) > div > div h1'),
    ...document.querySelectorAll('.project-metrics-value, .project-metrics-chip-value'),
  ];
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((c) => observer.observe(c));
}

function setupProcessStagger() {
  const track = document.querySelector('.process-track');
  if (!track) return;

  const cards = [...track.querySelectorAll('.process-card')];
  cards.forEach((card) => card.classList.add('process-card-ready'));

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;

    cards.forEach((card, i) => {
      const enterDelay = i * 90;
      setTimeout(() => {
        card.classList.add('process-card-in');
        setTimeout(() => card.classList.remove('process-card-ready'), 500);
      }, enterDelay);
    });

    observer.disconnect();
  }, { threshold: 0.12 });

  observer.observe(track);
}

function setupScrollReveal() {
  const sections = [...document.querySelectorAll('main > .section')];
  const toReveal = sections.slice(1);

  // For full-bleed sections (manifesto), animate the inner block directly so
  // the background stays visible while content is hidden. For all others, the
  // section wrapper itself is the target. Observe the same element we hide.
  const targets = toReveal.map((s) => {
    const inner = s.querySelector('.manifesto');
    const target = inner ?? s;
    target.classList.add('section-reveal');
    return target;
  });

  // Force a synchronous reflow on each target so opacity:0 is committed to the
  // render tree before IntersectionObserver fires for already-visible elements.
  // Without this, async IO callbacks can fire before the first paint, causing
  // both classes to land in the same frame and the transition to be skipped.
  targets.forEach((el) => el.getBoundingClientRect());

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach((el) => observer.observe(el));
}

export default function setupAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setupScrollReveal();
  setupCounters();
  setupProcessStagger();
}
