function getInitials(name) {
  return name.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function getAvatarColor(name) {
  const PALETTE = ['#4d9eff', '#4dbd74', '#9b6ef3', '#ffb900', '#ff6b35', '#e05cc8'];
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return PALETTE[sum % PALETTE.length];
}

function buildMemberCard(member) {
  const card = document.createElement('div');
  card.className = 'team-member-card';
  card.dataset.discipline = (member.discipline || '').toLowerCase();

  // Avatar + identity
  const top = document.createElement('div');
  top.className = 'team-member-top';

  const avatar = document.createElement('div');
  avatar.className = 'team-member-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  if (member.photo) {
    member.photo.alt = '';
    avatar.append(member.photo);
  } else {
    avatar.textContent = getInitials(member.name);
    avatar.style.setProperty('--avatar-color', getAvatarColor(member.name));
  }

  const identity = document.createElement('div');
  const nameEl = document.createElement('div');
  nameEl.className = 'team-member-name';
  nameEl.textContent = member.name;
  const handleEl = document.createElement('div');
  handleEl.className = 'team-member-handle';
  handleEl.textContent = member.handle;
  identity.append(nameEl, handleEl);
  top.append(avatar, identity);
  card.append(top);

  // Skill chips
  if (member.skills.length) {
    const skillsRow = document.createElement('div');
    skillsRow.className = 'team-member-skills';
    member.skills.forEach((s) => {
      const chip = document.createElement('span');
      chip.className = 'team-member-skill';
      chip.textContent = s;
      skillsRow.append(chip);
    });
    card.append(skillsRow);
  }

  // Footer: title + email
  const footer = document.createElement('div');
  footer.className = 'team-member-footer';

  if (member.title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'team-member-title';
    titleEl.textContent = member.title;
    footer.append(titleEl);
  }

  if (member.email) {
    const emailA = document.createElement('a');
    emailA.href = `mailto:${member.email}`;
    emailA.className = 'team-member-email';
    emailA.textContent = member.email;
    footer.append(emailA);
  }

  card.append(footer);
  return card;
}

export default function decorate(block) {
  const rows = [...block.children];
  block.innerHTML = '';

  const members = rows.map((row) => {
    const cells = [...row.children];
    return {
      name: cells[0]?.textContent.trim() || '',
      handle: cells[1]?.textContent.trim() || '',
      discipline: cells[2]?.textContent.trim() || '',
      skills: (cells[3]?.textContent.trim() || '').split(',').map((s) => s.trim()).filter(Boolean),
      title: cells[4]?.textContent.trim() || '',
      email: cells[5]?.textContent.trim() || '',
      photo: cells[6]?.querySelector('img') || null,
    };
  }).filter((m) => m.name);

  if (!members.length) return;

  // Count members per discipline for filter badge numbers
  const disciplineCounts = {};
  members.forEach((m) => {
    if (m.discipline) disciplineCounts[m.discipline] = (disciplineCounts[m.discipline] || 0) + 1;
  });

  // ── Filter bar ──────────────────────────────────────────────
  const filterBar = document.createElement('div');
  filterBar.className = 'team-filter-bar';
  filterBar.setAttribute('role', 'tablist');
  filterBar.setAttribute('aria-label', 'Filter team by discipline');

  function makeFilterBtn(label, count, discipline, isActive) {
    const btn = document.createElement('button');
    btn.className = `team-filter-btn${isActive ? ' active' : ''}`;
    btn.dataset.discipline = discipline;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    const countBadge = document.createElement('span');
    countBadge.className = 'team-filter-count';
    countBadge.textContent = count;
    btn.append(labelSpan, countBadge);
    return btn;
  }

  filterBar.append(makeFilterBtn('All', members.length, 'all', true));
  Object.entries(disciplineCounts).forEach(([d, c]) => {
    filterBar.append(makeFilterBtn(d, c, d.toLowerCase(), false));
  });

  // ── Member grid ─────────────────────────────────────────────
  const grid = document.createElement('div');
  grid.className = 'team-member-grid';
  members.forEach((m) => grid.append(buildMemberCard(m)));

  // ── Filter + preview-dim logic ──────────────────────────────
  const clearPreview = () => {
    [...grid.querySelectorAll('.team-member-card')].forEach((card) => {
      card.classList.remove('team-member-preview-dim');
    });
  };

  const applyFilter = (discipline) => {
    [...filterBar.querySelectorAll('.team-filter-btn')].forEach((btn) => {
      const active = btn.dataset.discipline === discipline;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    [...grid.querySelectorAll('.team-member-card')].forEach((card) => {
      const matches = discipline === 'all' || card.dataset.discipline === discipline;
      if (matches) {
        card.style.display = '';
        requestAnimationFrame(() => card.classList.remove('team-member-hidden'));
      } else {
        card.classList.add('team-member-hidden');
        setTimeout(() => {
          if (card.classList.contains('team-member-hidden')) card.style.display = 'none';
        }, 280);
      }
    });
  };

  // Hover: preview which cards match before committing to filter
  filterBar.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('.team-filter-btn');
    if (!btn || btn.classList.contains('active') || btn.dataset.discipline === 'all') {
      clearPreview();
      return;
    }
    const disc = btn.dataset.discipline;
    [...grid.querySelectorAll('.team-member-card')].forEach((card) => {
      card.classList.toggle('team-member-preview-dim', card.dataset.discipline !== disc);
    });
  });

  filterBar.addEventListener('mouseleave', clearPreview);

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.team-filter-btn');
    if (!btn) return;
    clearPreview();
    applyFilter(btn.dataset.discipline);
  });

  block.append(filterBar, grid);
}

