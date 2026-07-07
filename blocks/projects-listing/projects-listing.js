const STATUS = {
  active: { label: 'Active' },
  draft: { label: 'Draft' },
  closed: { label: 'Closed Win' },
  'not-started': { label: 'Hold' },
};

const STATUS_ORDER = ['active', 'draft', 'closed', 'not-started'];
const PAGE_SIZE = 9;

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

// Returns cards that match the current filter, in DOM order.
function getFilterMatches(grid, filter) {
  return [...grid.querySelectorAll('.project-card')].filter(
    (c) => filter === 'all' || c.dataset.status === filter,
  );
}

// Recalculates overflow display and updates the show-more button.
// Uses the filter value directly so it's never confused by in-flight
// class/display changes from ongoing filter animations.
function syncOverflow(grid, btn, filter) {
  const isExpanded = grid.classList.contains('projects-grid-expanded');
  const matching = getFilterMatches(grid, filter);

  matching.forEach((card, i) => {
    if (i >= PAGE_SIZE && !isExpanded) {
      card.style.display = 'none';
    } else if (!card.classList.contains('project-card-hidden')) {
      card.style.display = '';
    }
  });

  const overflowCount = Math.max(0, matching.length - PAGE_SIZE);
  if (overflowCount > 0) {
    btn.hidden = false;
    btn.textContent = isExpanded ? 'Show less' : `Show ${overflowCount} more`;
  } else {
    btn.hidden = true;
    grid.classList.remove('projects-grid-expanded');
  }
}

// Determines empty state from the filter value, not from DOM classes,
// so it's correct even before filter-change animations settle.
function syncEmptyState(grid, filter) {
  const matchCount = getFilterMatches(grid, filter).length;
  let empty = grid.querySelector('.projects-empty');
  if (!empty) {
    empty = document.createElement('p');
    empty.className = 'projects-empty';
    empty.setAttribute('role', 'status');
    empty.setAttribute('aria-live', 'polite');
    empty.textContent = 'No projects match this filter.';
    grid.append(empty);
  }
  empty.hidden = matchCount > 0;
}

function buildShowMore(grid, getFilter) {
  const btn = document.createElement('button');
  btn.className = 'projects-show-more';
  btn.type = 'button';
  btn.hidden = true;

  btn.addEventListener('click', () => {
    const collapsing = grid.classList.contains('projects-grid-expanded');
    grid.classList.toggle('projects-grid-expanded');
    syncOverflow(grid, btn, getFilter());
    if (collapsing) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  return btn;
}

function buildTabs(projects, grid, showMoreBtn, getFilter, setFilter) {
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

    grid.classList.remove('projects-grid-expanded');

    const { filter } = tab.dataset;
    setFilter(filter);

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

    // Both calls use the new filter value directly — no timing dependency on DOM state
    syncOverflow(grid, showMoreBtn, filter);
    syncEmptyState(grid, filter);
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

  window.__projectsCount = projects.length;
  document.dispatchEvent(new CustomEvent('projects:loaded', { detail: { count: projects.length } }));

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

  // activeFilter is the single source of truth for both overflow and empty-state
  let activeFilter = 'all';
  const getFilter = () => activeFilter;
  const setFilter = (f) => { activeFilter = f; };

  const showMoreBtn = buildShowMore(grid, getFilter);
  const tabs = buildTabs(projects, grid, showMoreBtn, getFilter, setFilter);

  block.append(header, tabs, grid, showMoreBtn);

  syncOverflow(grid, showMoreBtn, activeFilter);
  syncEmptyState(grid, activeFilter);
}
