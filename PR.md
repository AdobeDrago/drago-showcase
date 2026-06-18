# feat: Overview page — custom blocks, visual design, and Lighthouse compliance

Fix #<gh-issue-id>

**Test URLs:**
| | URL |
|---|---|
| Before | https://main--drago-showcase--adobedrago.aem.page |
| After | https://homepage-design--drago-showcase--adobedrago.aem.page/overview |

---

## What

Three areas of work shipped in this branch on top of the homepage overhaul PR:

- **Projects listing block** — Dynamic, query-index-driven project grid with status-based tab filtering (Active / Draft / Closed / Not started), loading and empty states, and left-border color coding per status.
- **Overview page blocks** — Three new custom blocks (`manifesto`, `process`, `offerings`) and two block variants (`columns (compare)`, `hero` without image) that implement the full seven-section overview page narrative.
- **Global design consistency + Lighthouse compliance** — Unified Adobe Clean font across all headings, section separators, touch-target sizing, keyboard skip link, and ARIA semantics across all new blocks.

---

## Why

The overview page follows a deliberate narrative arc — seven sections that each answer one question the reader has as they scroll. The existing boilerplate blocks couldn't express this:

- `manifesto` is a full-bleed, centered statement — no existing block supports full-bleed layout with an eyebrow label and a highlighted keyword.
- `process` needs phase-specific color logic (red → gold → dimmed) that generic cards can't encode.
- `offerings` is tabular data with auto-generated row numbers and two-column alignment — not suited to cards or columns.
- The `columns (compare)` variant needed explicit faded/strikethrough left vs. red-dot/gold right contrast to make the "traditional sales vs. PBYB" shift visceral without labels.

Lighthouse audit flagged: no skip link, buttons below 44px touch target, missing ARIA on the offerings table, and no page metadata block (noted for DA — see Anything Else).

---

## How

### Projects listing (`blocks/projects-listing/`)

- Fetches `/query-index.json` at runtime and maps status fields (`active`, `inProgress`, `closedWin`) to four status buckets.
- Builds a filterable tab bar with `role="tablist"` / `role="tab"` / `aria-controls` for keyboard navigation and screen reader announcement.
- Cards use a 3px left border color-coded by status: blue (active), yellow (draft), green (closed), gray (not started). The current page's card gets a gold "This site ✦" badge.
- Loading state uses three CSS-animated dots; error and empty states provide actionable copy.

### Manifesto block (`blocks/manifesto/`)

- JS flattens all cell content into a single `.manifesto-inner` container. An eyebrow label is detected by checking whether the first child is a `<p>` before a heading — if so, it receives `.manifesto-eyebrow`.
- Authors bold the key word in DA (e.g. **prototype.**) — the CSS targets `.manifesto-inner h2 strong { color: var(--color-accent-red) }`.
- Full-bleed layout is achieved via a `.section.tinted` Section Metadata class that removes `max-width` from the section wrapper and sets `background: #111`.

### Process block (`blocks/process/`)

- Reads five rows × four columns (number, title, duration, description) from the DA block table.
- Applies color logic at render time: rows 0–2 → red top border + red number bubble, row 3 → gold (the money moment), row 4 → 62% opacity + gray border + "Optional" badge tab at top-right corner.
- Horizontal flex track on desktop, vertical stack on mobile. Card padding 32px desktop, number bubble 34px diameter.

### Offerings block (`blocks/offerings/`)

- First row treated as column headers; rows 2–N are data. Row numbers are auto-generated (`01`–`05`) in monospace and marked `aria-hidden="true"`.
- Full ARIA table semantics on the div-based layout: `role="table"`, `role="row"`, `role="columnheader"`, `role="rowheader"`, `role="cell"`, with descriptive `aria-label` on each row header pulled from cell content.

### Hero — overview variant (`blocks/hero/hero.js`, `blocks/hero/hero.css`)

- `<strong>` elements in `h1` now receive `.hero-brand-accent` (red), replacing the hardcoded "Drago" regex. The old regex fires as a fallback when no `<strong>` is present (home page).
- `<p>` immediately before `h1` → `.hero-badge` (gray pill with dot indicator). `<p>` before that → `.hero-breadcrumb` (gray link, lifts to white on hover with underline).
- `:not(:has(picture))` widens text to 800px on desktop when no character image is present.
- Top padding increased 16px per breakpoint to create breathing room between nav breadcrumb and headline.

### Columns — compare variant (`blocks/columns/columns.css`)

- `.columns.compare` targets `h2, h3, h4` (all heading levels DA may produce) for column card headers: 22px bold, proper case, gray left / red right.
- Left card: `opacity: 0.65`, `list-style: none`, `text-decoration: line-through` on `<li>` elements.
- Right card: `border-left: 3px solid var(--color-accent-red)`, red dot `::before` on each `<li>`, last `<li>` in gold. Desktop-only `→` arrow pseudo-element between cards.

### Global design consistency (`styles/styles.css`)

- `--heading-font-family` changed from `adobe-clean-semicn` to `adobe-clean` — all headings now use the same family as body text per brand requirement.
- `main > .section` converted from margin-based to `padding: 64px 0` with `margin: 0`. `main > .section + .section` adds a `1px solid var(--color-border)` hairline between every section pair.
- Section-level `<p>` (eyebrow labels like "The shift", "How it works") styled as 11px uppercase gray labels. Selector uses `:not(.button-container)` to prevent button text inheriting the treatment.
- `.section.tinted` — full-bleed, `background: #111`, zero padding (block handles its own spacing).
- `.section.cta` — centered text, `padding: 88px 0`, no top border, large `h2` via `clamp(28px, 4vw, 44px)`.

### Lighthouse compliance (`styles/styles.css`, `scripts/scripts.js`)

- **Skip link** — `.skip-to-main` injected as `document.body.firstChild` in `loadEager`. Visually hidden via `transform: translateY(-100%)`, slides in on `:focus`. `<main>` receives `id="main-content"` at the same point.
- **Touch targets** — `a.button` and `button` changed from `display: inline-block` to `display: inline-flex; align-items: center; justify-content: center; min-height: 44px` (WCAG 2.5.5).

---

## Testing

- [x] Mobile (375px): manifesto text wraps correctly, process cards stack vertically, offerings rows single-column, compare cards full-width
- [x] Tablet (768px): process cards 2-up, compare side by side
- [x] Desktop (1280px): all five process phases in a horizontal row, offerings two-column, compare arrow visible between cards
- [x] Hero (overview): badge pill gray, breadcrumb link gray at rest / white + underline on hover, "Prototype" in red
- [x] Hero (home): "Drago" red fallback still fires, no regression
- [x] Compare block: left column faded + strikethrough, right column red border + red dots, last item gold
- [x] Section separators render between all sections; tinted manifesto section has no border bleed
- [x] Skip link visible on first Tab keypress, hidden otherwise
- [x] Buttons reach 44px minimum height at all breakpoints
- [x] Projects listing: tab filter hides/shows cards correctly, loading dots animate, empty state visible when no matches

---

## Anything Else

- The `manifesto`, `process`, and `offerings` blocks are authored entirely in DA block tables — no custom JavaScript is required from content authors beyond standard block naming.
- **DA action required for full Lighthouse SEO compliance:** each page needs a **Page Metadata** block with `Title` and `Description` rows. Without it, Lighthouse SEO will flag the missing `<meta name="description">` and non-unique `<title>`.
- The `columns (compare)` variant requires authors to use **Heading 3** (not Heading 2) for card titles in DA, and **bulleted lists** (not plain paragraphs) for comparison items. Plain paragraphs will not receive the strikethrough or red-dot treatment.
- All block JS files are under 70 lines; no third-party dependencies introduced.
- Three lint errors fixed to pass CI: unused `doLabel` variable removed from `offerings.js`; destructured parameters in `process/process.js` and `process-steps/process-steps.js` split onto their own lines to satisfy the `object-curly-newline` rule. The remaining 9 CI errors (`plugins/experimentation/` and `scripts/sidekick.js`) are pre-existing on `main` and unrelated to this branch.
