export default function decorate(block) {
  const h1 = block.querySelector('h1');
  if (h1) {
    // <strong> in h1 (bolded in DA) → red accent. Covers both home and overview pages.
    const strongs = h1.querySelectorAll('strong');
    if (strongs.length) {
      strongs.forEach((s) => s.classList.add('hero-brand-accent'));
    } else {
      // Fallback for home page where "Drago" is not explicitly bolded
      h1.innerHTML = h1.innerHTML.replace(/Drago/g, '<span class="hero-brand-accent">Drago</span>');
    }

    // Badge pill: <p> immediately before the h1 → styled as a labelled pill
    const prev = h1.previousElementSibling;
    if (prev && prev.tagName === 'P') {
      prev.classList.add('hero-badge');

      // Breadcrumb: <p> one step further up (authored as the first line in the hero cell)
      const crumb = prev.previousElementSibling;
      if (crumb && crumb.tagName === 'P') {
        crumb.classList.add('hero-breadcrumb');
      }
    }
  }

  // Group button containers into a single flex row
  const buttonContainers = [...block.querySelectorAll('.button-container')];
  if (buttonContainers.length > 1) {
    const heroButtons = document.createElement('div');
    heroButtons.className = 'hero-buttons';
    buttonContainers[0].before(heroButtons);
    buttonContainers.forEach((bc) => heroButtons.append(bc));
  }
}
