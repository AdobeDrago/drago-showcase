export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  block.innerHTML = '';

  // Column headers
  const header = document.createElement('div');
  header.className = 'offerings-header';
  [...headerRow.children].forEach((cell) => {
    const th = document.createElement('div');
    th.className = 'offerings-header-cell';
    th.innerHTML = cell.innerHTML;
    header.append(th);
  });

  // Data rows
  const table = document.createElement('div');
  table.className = 'offerings-table';
  table.setAttribute('role', 'list');

  dataRows.forEach((row, i) => {
    const cells = [...row.children];
    const rowEl = document.createElement('div');
    rowEl.className = 'offerings-row';
    rowEl.setAttribute('role', 'listitem');

    // Left cell: auto row number + content from cell 0
    const leftCell = document.createElement('div');
    leftCell.className = 'offerings-cell offerings-cell-prove';

    const num = document.createElement('span');
    num.className = 'offerings-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(i + 1).padStart(2, '0');

    const leftContent = document.createElement('div');
    leftContent.className = 'offerings-cell-content';
    if (cells[0]) leftContent.innerHTML = cells[0].innerHTML;

    leftCell.append(num, leftContent);

    // Right cell: content from cell 1
    const rightCell = document.createElement('div');
    rightCell.className = 'offerings-cell offerings-cell-do';
    if (cells[1]) rightCell.innerHTML = cells[1].innerHTML;

    rowEl.append(leftCell, rightCell);
    table.append(rowEl);
  });

  block.append(header, table);
}
