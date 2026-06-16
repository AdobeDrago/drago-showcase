export default function decorate(block) {
  const steps = [...block.children].map((row, i) => {
    const cells = [...row.children];
    return {
      number: i + 1,
      title: cells[0]?.textContent.trim(),
      description: cells[1]?.textContent.trim(),
      outcome: cells[2]?.textContent.trim(),
    };
  });

  block.innerHTML = '';

  const ol = document.createElement('ol');
  ol.className = 'process-steps-list';
  ol.setAttribute('aria-label', 'PBYB program lifecycle');

  steps.forEach(({ number, title, description, outcome }) => {
    const li = document.createElement('li');
    li.className = 'process-step';

    const numEl = document.createElement('div');
    numEl.className = 'process-step-num';
    numEl.setAttribute('aria-hidden', 'true');
    numEl.textContent = number;

    const body = document.createElement('div');
    body.className = 'process-step-body';

    const titleEl = document.createElement('h3');
    titleEl.className = 'process-step-title';
    titleEl.textContent = title;

    const descEl = document.createElement('p');
    descEl.className = 'process-step-desc';
    descEl.textContent = description;

    body.append(titleEl, descEl);

    if (outcome) {
      const outcomeEl = document.createElement('span');
      outcomeEl.className = 'process-step-outcome';
      outcomeEl.textContent = outcome;
      body.append(outcomeEl);
    }

    li.append(numEl, body);
    ol.append(li);
  });

  block.append(ol);
}
