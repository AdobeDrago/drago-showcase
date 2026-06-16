// Color logic: rows 0-2 → red, row 3 → gold (the money moment), row 4 → optional/dimmed
const PHASE_COLORS = ['red', 'red', 'red', 'gold', 'optional'];

export default function decorate(block) {
  const phases = [...block.children].map((row, i) => {
    const cells = [...row.children];
    return {
      index: i,
      number: cells[0]?.textContent.trim() || String(i + 1),
      title: cells[1]?.textContent.trim(),
      duration: cells[2]?.textContent.trim(),
      description: cells[3]?.textContent.trim(),
    };
  });

  block.innerHTML = '';

  const track = document.createElement('div');
  track.className = 'process-track';
  track.setAttribute('role', 'list');

  phases.forEach(({ index, number, title, duration, description }) => {
    const color = PHASE_COLORS[index] ?? 'red';

    const card = document.createElement('div');
    card.className = `process-card process-card-${color}`;
    card.setAttribute('role', 'listitem');

    if (color === 'optional') {
      const badge = document.createElement('span');
      badge.className = 'process-card-opt-badge';
      badge.setAttribute('aria-label', 'Optional phase');
      badge.textContent = 'Optional';
      card.append(badge);
    }

    const numEl = document.createElement('div');
    numEl.className = 'process-card-num';
    numEl.setAttribute('aria-hidden', 'true');
    numEl.textContent = number;

    const titleEl = document.createElement('h3');
    titleEl.className = 'process-card-title';
    titleEl.textContent = title;

    const durationEl = document.createElement('div');
    durationEl.className = 'process-card-duration';
    durationEl.textContent = duration;

    const descEl = document.createElement('p');
    descEl.className = 'process-card-desc';
    descEl.textContent = description;

    card.append(numEl, titleEl, durationEl, descEl);
    track.append(card);
  });

  block.append(track);
}
