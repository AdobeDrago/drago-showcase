// Row 0 → before (value | label)
// Row 1 → after  (value | label)
// Rows 2+ → metric chips (value | label)
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const [beforeRow, afterRow, ...chipRows] = rows;
  const beforeValue = beforeRow.children[0]?.textContent.trim() ?? '';
  const beforeLabel = beforeRow.children[1]?.textContent.trim() ?? '';
  const afterValue = afterRow.children[0]?.textContent.trim() ?? '';
  const afterLabel = afterRow.children[1]?.textContent.trim() ?? '';

  block.textContent = '';

  // ── Before / After ────────────────────────────────────────
  const comparison = document.createElement('div');
  comparison.className = 'project-metrics-comparison';

  const makeBox = (period, value, label, variant) => {
    const box = document.createElement('div');
    box.className = `project-metrics-box project-metrics-${variant}`;

    const periodEl = document.createElement('span');
    periodEl.className = 'project-metrics-period';
    periodEl.textContent = period;

    const valueEl = document.createElement('span');
    valueEl.className = 'project-metrics-value';
    valueEl.textContent = value;

    const labelEl = document.createElement('span');
    labelEl.className = 'project-metrics-label';
    labelEl.textContent = label;

    box.append(periodEl, valueEl, labelEl);
    return box;
  };

  const arrow = document.createElement('div');
  arrow.className = 'project-metrics-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';

  comparison.append(
    makeBox('Before', beforeValue, beforeLabel, 'before'),
    arrow,
    makeBox('After', afterValue, afterLabel, 'after'),
  );
  block.append(comparison);

  // ── Metric chips ───────────────────────────────────────────
  if (chipRows.length) {
    const chips = document.createElement('div');
    chips.className = 'project-metrics-chips';

    chipRows.forEach((row) => {
      const value = row.children[0]?.textContent.trim();
      const label = row.children[1]?.textContent.trim();
      if (!value) return;

      const chip = document.createElement('div');
      chip.className = 'project-metrics-chip';

      const v = document.createElement('span');
      v.className = 'project-metrics-chip-value';
      v.textContent = value;

      const l = document.createElement('span');
      l.className = 'project-metrics-chip-label';
      l.textContent = label ?? '';

      chip.append(v, l);
      chips.append(chip);
    });

    block.append(chips);
  }
}
