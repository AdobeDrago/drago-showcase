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
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  wireProjectsCount(block);
}
