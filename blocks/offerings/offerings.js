export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  const headerCells = [...headerRow.children];

  block.innerHTML = '';

  // Column headers — aria-label pulled for screen readers on each data cell
  const proveLabel = headerCells[0]?.textContent.trim() || 'What we prove';
  const doLabel = headerCells[1]?.textContent.trim() || 'What we do';

  const header = document.createElement('div');
  header.className = 'offerings-header';
  header.setAttribute('role', 'row');
  header.setAttribute('aria-label', 'Program offerings column headers');

  headerCells.forEach((cell) => {
    const th = document.createElement('div');
    th.className = 'offerings-header-cell';
    th.setAttribute('role', 'columnheader');
    th.innerHTML = cell.innerHTML;
    header.append(th);
  });

  // Data rows
  const table = document.createElement('div');
  table.className = 'offerings-table';
  table.setAttribute('role', 'table');
  table.setAttribute('aria-label', 'Program offerings');

  dataRows.forEach((row, i) => {
    const cells = [...row.children];
    const rowEl = document.createElement('div');
    rowEl.className = 'offerings-row';
    rowEl.setAttribute('role', 'row');

    // Left cell: auto row number + content from cell 0
    const leftCell = document.createElement('div');
    leftCell.className = 'offerings-cell offerings-cell-prove';
    leftCell.setAttribute('role', 'rowheader');
    leftCell.setAttribute('aria-label', `${proveLabel}: ${cells[0]?.textContent.trim()}`);

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
    rightCell.setAttribute('role', 'cell');
    if (cells[1]) rightCell.innerHTML = cells[1].innerHTML;

    rowEl.append(leftCell, rightCell);
    table.append(rowEl);
  });

  block.append(header, table);
}
