function animateCounter(el) {
  const raw = el.textContent.trim();
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(num) || num === 0) return;

  const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
  const suffix = raw.match(/[^0-9.]*$/)?.[0] || '';
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
  const counters = [...document.querySelectorAll('.columns:not(.compare) > div > div h1')];
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

  toReveal.forEach((s) => {
    if (s.classList.contains('tinted')) {
      // Full-bleed sections: animate the inner block, not the section wrapper,
      // so the background stays visible and there's no "hole" while invisible.
      const block = s.querySelector('.manifesto');
      if (block) block.classList.add('section-reveal');
    } else {
      s.classList.add('section-reveal');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const section = entry.target;
      if (section.classList.contains('tinted')) {
        const block = section.querySelector('.manifesto.section-reveal');
        if (block) block.classList.add('revealed');
      } else {
        section.classList.add('revealed');
      }
      observer.unobserve(section);
    });
  }, { threshold: 0.07 });

  toReveal.forEach((s) => observer.observe(s));
}

export default function setupAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setupScrollReveal();
  setupCounters();
  setupProcessStagger();
}
