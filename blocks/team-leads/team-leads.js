function getInitials(name) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function getAvatarColor(name) {
  const PALETTE = ['#4d9eff', '#4dbd74', '#9b6ef3', '#ffb900', '#ff6b35', '#e05cc8'];
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return PALETTE[sum % PALETTE.length];
}

export default function decorate(block) {
  const rows = [...block.children];
  block.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'team-leads-grid';

  rows.forEach((row) => {
    const cells = [...row.children];
    const name = cells[0]?.textContent.trim() || '';
    const handle = cells[1]?.textContent.trim() || '';
    const roles = (cells[2]?.textContent.trim() || '').split(',').map((s) => s.trim()).filter(Boolean);
    const skills = (cells[3]?.textContent.trim() || '').split(',').map((s) => s.trim()).filter(Boolean);
    const title = cells[4]?.textContent.trim() || '';
    const email = cells[5]?.textContent.trim() || '';

    if (!name) return;

    const card = document.createElement('div');
    card.className = 'team-lead-card';

    // Role pills (first = primary with dot indicator, rest = secondary)
    if (roles.length) {
      const roleRow = document.createElement('div');
      roleRow.className = 'team-lead-roles';
      roles.forEach((r, i) => {
        const pill = document.createElement('span');
        pill.className = i === 0 ? 'team-lead-role-pill primary' : 'team-lead-role-pill';
        pill.textContent = r;
        roleRow.append(pill);
      });
      card.append(roleRow);
    }

    // Identity: avatar + name/handle
    const identity = document.createElement('div');
    identity.className = 'team-lead-identity';

    const avatar = document.createElement('div');
    avatar.className = 'team-lead-avatar';
    avatar.textContent = getInitials(name);
    avatar.style.setProperty('--avatar-color', getAvatarColor(name));
    avatar.setAttribute('aria-hidden', 'true');

    const nameGroup = document.createElement('div');
    const nameEl = document.createElement('div');
    nameEl.className = 'team-lead-name';
    nameEl.textContent = name;
    const handleEl = document.createElement('div');
    handleEl.className = 'team-lead-handle';
    handleEl.textContent = handle;
    nameGroup.append(nameEl, handleEl);
    identity.append(avatar, nameGroup);
    card.append(identity);

    // Skill chips
    if (skills.length) {
      const skillsRow = document.createElement('div');
      skillsRow.className = 'team-lead-skills';
      skills.forEach((s) => {
        const chip = document.createElement('span');
        chip.className = 'team-lead-skill';
        chip.textContent = s;
        skillsRow.append(chip);
      });
      card.append(skillsRow);
    }

    // Footer: title + email
    const footer = document.createElement('div');
    footer.className = 'team-lead-footer';

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'team-lead-title';
      titleEl.textContent = title;
      footer.append(titleEl);
    }

    if (email) {
      const emailA = document.createElement('a');
      emailA.href = `mailto:${email}`;
      emailA.className = 'team-lead-email';
      emailA.textContent = email;
      footer.append(emailA);
    }

    card.append(footer);
    grid.append(card);
  });

  block.append(grid);
}
