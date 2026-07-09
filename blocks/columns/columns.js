function getBadgeCls(text) {
  const lower = text.toLowerCase().trim();
  if (lower === 'active') return 'hero-project-badge-active';
  if (lower === 'draft') return 'hero-project-badge-draft';
  if (lower === 'closed win') return 'hero-project-badge-closed';
  if (lower === 'hold') return 'hero-project-badge-hold';
  if (text.includes('$')) return 'hero-project-badge-deal';
  return 'hero-project-badge-outlined';
}

function decorateProjectHero(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const leftCell = row.children[0];
  const rightCell = row.children[1];
  if (!leftCell) return;

  // Parse left cell: first <p> before heading = badges, heading = title,
  // first <p> after heading = tags, remaining <p> = description.
  const allChildren = [...leftCell.children];
  let badgesEl = null;
  let titleEl = null;
  let tagsEl = null;
  const descEls = [];

  allChildren.forEach((child) => {
    const { tagName } = child;
    if (!titleEl && /^H[1-6]$/.test(tagName)) {
      titleEl = child;
    } else if (!titleEl && tagName === 'P') {
      badgesEl = child;
    } else if (titleEl && !tagsEl && tagName === 'P') {
      tagsEl = child;
    } else if (tagsEl && tagName === 'P') {
      descEls.push(child);
    }
  });

  block.textContent = '';

  const body = document.createElement('div');
  body.className = 'hero-project-body';

  const left = document.createElement('div');
  left.className = 'hero-project-left';

  const badgesText = badgesEl?.textContent?.trim() ?? '';
  if (badgesText) {
    const badgeRow = document.createElement('div');
    badgeRow.className = 'hero-project-badges';
    badgesText.split(/[,•|]/).map((s) => s.trim()).filter(Boolean).forEach((text) => {
      const b = document.createElement('span');
      b.className = `hero-project-badge ${getBadgeCls(text)}`;
      b.textContent = text;
      badgeRow.append(b);
    });
    left.append(badgeRow);
  }

  if (titleEl) {
    titleEl.className = 'hero-project-title';
    left.append(titleEl);
  }

  const tagsText = tagsEl?.textContent?.trim() ?? '';
  if (tagsText) {
    const tagRow = document.createElement('div');
    tagRow.className = 'hero-project-tags';
    tagsText.split(/[,•|]/).map((s) => s.trim()).filter(Boolean).forEach((text) => {
      const chip = document.createElement('span');
      chip.className = 'hero-project-tag';
      chip.textContent = text;
      tagRow.append(chip);
    });
    left.append(tagRow);
  }

  descEls.forEach((el) => {
    el.className = 'hero-project-desc';
    left.append(el);
  });

  body.append(left);

  if (rightCell) {
    const pic = rightCell.querySelector('picture') ?? rightCell.querySelector('img');
    if (pic) {
      const right = document.createElement('div');
      right.className = 'hero-project-right';
      const logoWrap = document.createElement('div');
      logoWrap.className = 'hero-project-logo';
      logoWrap.append(pic.closest ? (pic.closest('picture') ?? pic) : pic);
      right.append(logoWrap);
      body.append(right);
    }
  }

  block.append(body);
}

function decorateNarrativeCell(cell) {
  const paras = [...cell.querySelectorAll('p')].filter((p) => p.textContent.trim());
  const existingList = cell.querySelector('ul, ol');

  const bulletParas = paras.filter((p) => p.textContent.trim().startsWith('•'));
  const narrativeParas = paras.filter((p) => !p.textContent.trim().startsWith('•'));

  if (narrativeParas[0]) narrativeParas[0].classList.add('columns-scope-narrative');

  if (bulletParas.length && !existingList) {
    const ul = document.createElement('ul');
    ul.className = 'columns-scope-list';
    bulletParas.forEach((p) => {
      const li = document.createElement('li');
      li.textContent = p.textContent.replace(/^[•\-]\s*/, '').trim();
      ul.append(li);
      p.remove();
    });
    cell.append(ul);
  } else if (existingList) {
    existingList.classList.add('columns-scope-list');
  }
}

function decorateScopeCell(cell) {
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  const paras = [...cell.querySelectorAll('p')].filter((p) => p.textContent.trim());

  cell.textContent = '';

  if (heading) {
    heading.className = 'columns-scope-heading';
    cell.append(heading);
  }

  const dl = document.createElement('dl');
  dl.className = 'columns-scope-dl';

  paras.forEach((p) => {
    const text = p.textContent.trim();
    const colonIdx = text.indexOf(':');
    if (colonIdx === -1) return;
    const dt = document.createElement('dt');
    dt.textContent = text.slice(0, colonIdx).trim();
    const dd = document.createElement('dd');
    dd.textContent = text.slice(colonIdx + 1).trim();
    dl.append(dt, dd);
  });

  cell.append(dl);
}

function wireProjectsCount(block) {
  const labels = [...block.querySelectorAll('h4')];
  const projectsLabel = labels.find((h) => h.textContent.trim().toLowerCase() === 'projects');
  if (!projectsLabel) return;

  const statEl = projectsLabel.closest('div')?.querySelector('h1, h2, h3');
  if (!statEl) return;

  const update = (count) => { statEl.textContent = count; };

  if (window.__projectsCount != null) {
    update(window.__projectsCount);
  } else {
    document.addEventListener('projects:loaded', (e) => update(e.detail.count), { once: true });
  }
}

export default function decorate(block) {
  if (block.classList.contains('project-hero')) {
    decorateProjectHero(block);
    return;
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (block.classList.contains('scope')) {
    [...block.children].forEach((row) => {
      const cells = [...row.children];
      if (cells.length >= 2) {
        decorateNarrativeCell(cells[0]);
        decorateScopeCell(cells[cells.length - 1]);
      }
    });
  }

  wireProjectsCount(block);
}
