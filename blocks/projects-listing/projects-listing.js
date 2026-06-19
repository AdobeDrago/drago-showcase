const STATUS = {
  active: { label: 'Active' },
  draft: { label: 'Draft' },
  closed: { label: 'Closed Win' },
  'not-started': { label: 'Not started' },
};

const STATUS_ORDER = ['active', 'draft', 'closed', 'not-started'];

function getStatus(project) {
  if (project.active === 'true') return 'active';
  if (project.inProgress === 'true') return 'draft';
  if (project.closedWin === 'true') return 'closed';
  return 'not-started';
}

function buildCard(project, index) {
  const isCurrent = project.path === window.location.pathname;
  const status = getStatus(project);
  const cardStatus = isCurrent ? 'current' : status;
  const badgeLabel = isCurrent ? 'This site ✦' : STATUS[status].label;

  const card = document.createElement('a');
  card.className = `project-card project-card-${cardStatus}`;
  card.href = project.path;
  card.dataset.status = cardStatus;
  card.setAttribute('aria-label', `${project.title}, ${badgeLabel}`);

  const num = document.createElement('span');
  num.className = 'project-card-num';
  num.setAttribute('aria-hidden', 'true');
  num.textContent = String(index + 1).padStart(2, '0');

  const title = document.createElement('h3');
  title.className = 'project-card-title';
  title.textContent = project.title;

  const desc = document.createElement('p');
  desc.className = 'project-card-desc';
  desc.textContent = project.description;

  const footer = document.createElement('div');
  footer.className = 'project-card-footer';
  footer.setAttribute('aria-hidden', 'true');

  const badge = document.createElement('span');
  badge.className = `project-card-badge project-card-badge-${cardStatus}`;
  badge.textContent = badgeLabel;

  const arrow = document.createElement('span');
  arrow.className = 'project-card-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';

  footer.append(badge, arrow);
  card.append(num, title, desc, footer);

  return card;
}

function syncEmptyState(grid) {
  const visible = grid.querySelectorAll('.project-card:not(.project-card-hidden)').length;
  let empty = grid.querySelector('.projects-empty');
  if (!empty) {
    empty = document.createElement('p');
    empty.className = 'projects-empty';
    empty.setAttribute('role', 'status');
    empty.setAttribute('aria-live', 'polite');
    empty.textContent = 'No projects match this filter.';
    grid.append(empty);
  }
  empty.hidden = visible > 0;
}

function buildTabs(projects, grid) {
  const counts = {};
  projects.forEach((p) => {
    const s = getStatus(p);
    counts[s] = (counts[s] || 0) + 1;
  });

  const panelId = 'projects-grid-panel';
  grid.id = panelId;
  grid.setAttribute('role', 'tabpanel');
  grid.setAttribute('tabindex', '0');

  const tabsEl = document.createElement('div');
  tabsEl.className = 'project-tabs';
  tabsEl.setAttribute('role', 'tablist');
  tabsEl.setAttribute('aria-label', 'Filter projects by status');

  const makeTab = (filter, label, count, isActive) => {
    const btn = document.createElement('button');
    btn.className = `project-tab${isActive ? ' project-tab-active' : ''}`;
    btn.dataset.filter = filter;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('aria-controls', panelId);
    btn.type = 'button';

    if (filter !== 'all') {
      const dot = document.createElement('span');
      dot.className = `project-tab-dot project-tab-dot-${filter}`;
      dot.setAttribute('aria-hidden', 'true');
      btn.append(dot);
    }

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    const countBadge = document.createElement('span');
    countBadge.className = 'project-tab-count';
    countBadge.textContent = count;
    btn.append(labelSpan, countBadge);

    return btn;
  };

  tabsEl.append(makeTab('all', 'All', projects.length, true));
  STATUS_ORDER.forEach((s) => {
    if (!counts[s]) return;
    tabsEl.append(makeTab(s, STATUS[s].label, counts[s], false));
  });

  // Preview-dim: hover an inactive tab to preview which cards match
  const clearPreview = () => {
    grid.querySelectorAll('.project-card').forEach((card) => {
      card.classList.remove('project-card-preview-dim');
    });
  };

  tabsEl.addEventListener('mouseover', (e) => {
    const tab = e.target.closest('[data-filter]');
    if (!tab || tab.classList.contains('project-tab-active') || tab.dataset.filter === 'all') {
      clearPreview();
      return;
    }
    const { filter } = tab.dataset;
    grid.querySelectorAll('.project-card').forEach((card) => {
      card.classList.toggle('project-card-preview-dim', card.dataset.status !== filter);
    });
  });

  tabsEl.addEventListener('mouseleave', clearPreview);

  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-filter]');
    if (!tab) return;

    clearPreview();

    tabsEl.querySelectorAll('.project-tab').forEach((t) => {
      t.classList.remove('project-tab-active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('project-tab-active');
    tab.setAttribute('aria-selected', 'true');

    const { filter } = tab.dataset;
    grid.querySelectorAll('.project-card').forEach((card) => {
      const matches = filter === 'all' || card.dataset.status === filter;
      if (matches) {
        card.style.display = '';
        requestAnimationFrame(() => card.classList.remove('project-card-hidden'));
      } else {
        card.classList.add('project-card-hidden');
        setTimeout(() => {
          if (card.classList.contains('project-card-hidden')) card.style.display = 'none';
        }, 280);
      }
    });

    syncEmptyState(grid);
  });

  return tabsEl;
}

export default async function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;

  block.innerHTML = `
    <div class="projects-loading" role="status" aria-live="polite">
      <span class="projects-loading-dots" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
      <span class="visually-hidden">Loading projects…</span>
    </div>`;

  let json;
  try {
    const resp = await fetch(link.href);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    json = await resp.json();
  } catch {
    block.innerHTML = '<p class="projects-error" role="alert">Could not load projects — please refresh the page.</p>';
    return;
  }

  const projects = (json.data || [])
    .filter((p) => p.title)
    .sort((a, b) => STATUS_ORDER.indexOf(getStatus(a)) - STATUS_ORDER.indexOf(getStatus(b)));

  block.textContent = '';

  const header = document.createElement('div');
  header.className = 'projects-header';

  const countEl = document.createElement('span');
  countEl.className = 'projects-count';
  countEl.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''}`;

  header.append(countEl);

  const grid = document.createElement('div');
  grid.className = 'projects-grid';
  projects.forEach((p, i) => grid.append(buildCard(p, i)));

  const tabs = buildTabs(projects, grid);

  block.append(header, tabs, grid);
}

