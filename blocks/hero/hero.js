export default function decorate(block) {
  // Wrap "Drago" in h1 with red accent span
  const h1 = block.querySelector('h1');
  if (h1) {
    h1.innerHTML = h1.innerHTML.replace(/Drago/g, '<span class="hero-brand-accent">Drago</span>');
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
