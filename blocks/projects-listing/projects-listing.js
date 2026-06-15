const STATUS = {
  active: { label: 'Active' },
  draft: { label: 'Draft' },
  closed: { label: 'Closed Win' },
  'not-started': { label: 'Not started' },
};

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
  card.className = `project-card project-card--${cardStatus}`;
  card.href = project.path;
  card.dataset.status = cardStatus;

  const num = document.createElement('span');
  num.className = 'project-card-num';
  num.textContent = String(index + 1).padStart(2, '0');

  const title = document.createElement('h3');
  title.className = 'project-card-title';
  title.textContent = project.title;

  const desc = document.createElement('p');
  desc.className = 'project-card-desc';
  desc.textContent = project.description;

  const footer = document.createElement('div');
  footer.className = 'project-card-footer';

  const badge = document.createElement('span');
  badge.className = `project-card-badge project-card-badge--${cardStatus}`;
  badge.textContent = badgeLabel;

  const arrow = document.createElement('span');
  arrow.className = 'project-card-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';

  footer.append(badge, arrow);
  card.append(num, title, desc, footer);

  return card;
}

function buildTabs(projects, grid) {
  const counts = {};
  projects.forEach((p) => {
    const s = getStatus(p);
    counts[s] = (counts[s] || 0) + 1;
  });

  const tabsEl = document.createElement('div');
  tabsEl.className = 'project-tabs';

  const allBtn = document.createElement('button');
  allBtn.className = 'project-tab project-tab--active';
  allBtn.dataset.filter = 'all';
  allBtn.textContent = 'All';
  tabsEl.append(allBtn);

  ['active', 'draft', 'closed', 'not-started'].forEach((s) => {
    if (!counts[s]) return;

    const btn = document.createElement('button');
    btn.className = 'project-tab';
    btn.dataset.filter = s;

    const dot = document.createElement('span');
    dot.className = `project-tab-dot project-tab-dot--${s}`;

    const countSpan = document.createElement('span');
    countSpan.className = 'project-tab-count';
    countSpan.textContent = counts[s];

    btn.append(dot, document.createTextNode(` ${STATUS[s].label} `), countSpan);
    tabsEl.append(btn);
  });

  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-filter]');
    if (!tab) return;
    tabsEl.querySelectorAll('.project-tab').forEach((t) => t.classList.remove('project-tab--active'));
    tab.classList.add('project-tab--active');
    const { filter } = tab.dataset;
    grid.querySelectorAll('.project-card').forEach((card) => {
      card.classList.toggle('project-card--hidden', filter !== 'all' && card.dataset.status !== filter);
    });
  });

  return tabsEl;
}

export default async function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;

  let json;
  try {
    const resp = await fetch(link.href);
    if (!resp.ok) return;
    json = await resp.json();
  } catch {
    return;
  }

  const STATUS_ORDER = ['active', 'draft', 'closed', 'not-started'];
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
