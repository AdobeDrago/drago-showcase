export default function decorate(block) {
  const rows = [...block.children];
  const inner = document.createElement('div');
  inner.className = 'manifesto-inner';

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      // Move all child nodes out of the cell wrapper
      inner.append(...cell.childNodes);
    });
  });

  block.innerHTML = '';
  block.append(inner);

  // First <p> before a heading → eyebrow label
  const heading = inner.querySelector('h1,h2,h3');
  if (heading) {
    const prev = heading.previousElementSibling;
    if (prev && prev.tagName === 'P') {
      prev.classList.add('manifesto-eyebrow');
    }
  }
}
