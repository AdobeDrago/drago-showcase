**Test URLs:**
| | URL |
|---|---|
| Before | https://main--drago-showcase--adobedrago.aem.page/projects |
| After | https://project-pages--drago-showcase--adobedrago.aem.page/projects |

---

## What

Two areas of work on this branch:

- **Projects page redesign** — replaced the flat tab/grid layout with an industry-grouped view: each industry is a labeled row with logo cards that link to individual project pages. Rows with more than 5 projects auto-scroll as a seamless conveyor belt.
- **projects-listing quality** — alphabetical sort, updated status labels, `prefers-reduced-motion` support, heading hierarchy fix, and image loading improvements.

---

## Why

The flat grid with status tabs gave no sense of portfolio breadth across industries. The new layout lets a viewer instantly read which verticals the team is active in and scan the logos without clicking into individual projects. The conveyor belt auto-scroll communicates scale for large industry groups without requiring interaction.

---

## How

### helix-query.yaml

Added an `industry` property that reads from `<meta name="industry">` on each project page. Authors set this in the da.live Metadata table. The field is used to group projects in the new variant; no changes to existing indexed fields.

### projects-listing (industry-grouped) variant (`blocks/projects-listing/`)

- `decorate()` checks for the `industry-grouped` class and routes to `buildIndustryGrouped()` — the existing tab/grid path is untouched.
- `buildIndustryGrouped()` fetches the same `query-index.json`, groups projects by the `industry` field (alphabetically A→Z, "Other" last), and renders one `.ipl-group` per industry: a left header column (`h2` name + count) and a right card row.
- `buildIndustryCard()` renders each project as a logo card: `<img>` sourced from `project.image` with CDN query params stripped to preserve PNG transparency, `filter: brightness(0) invert(1)` makes all logos white on the dark card, and a status dot + label row at the bottom.
- Rows with >5 projects get a `.ipl-row-track` wrapper whose child cards are duplicated (clones are `aria-hidden` / `tabindex="-1"`). A CSS `@keyframes ipl-marquee` animation translates the track by `--scroll-dist` (computed as `n × (cardWidth + gap)` — the exact pixel width of one full set including the trailing gap before the first clone, ensuring a seamless loop). Duration scales with distance at 30 px/s for consistent speed. Pauses on `:hover` / `:focus-within` via `animation-play-state: paused`. Skipped entirely via `@media (prefers-reduced-motion: reduce)`.

### Status labels

Updated `STATUS` map: `draft` → "Prototype Build", `not-started` → "On Hold". Labels now match what appears in project hero badges and the design system.

### Alphabetical sort

`projects-listing.js` now sorts by `a.title.localeCompare(b.title)` instead of status order — applies to both the default grid and the industry-grouped variant.

### Design polish (CSS)

- Industry group headers: `h2`, 22px/700, red left-border accent (`border-left: 2px solid var(--color-accent-red)`)
- "X projects" counter: small red dot `::before` pseudo-element
- Card width: 168px → 180px
- Section top padding reduced to 16px via `:has(.projects-listing.industry-grouped)` selector to remove dead space below the hero

---

## Testing

- [x] Industry groups render correctly from `query-index.json` `industry` field
- [x] Projects without `industry` fall back to "Other" group
- [x] Alphabetical sort within each group
- [x] Logo cards link to correct project pages
- [x] White logos render correctly for transparent PNGs; `filter: brightness(0) invert(1)` applied
- [x] CDN query params stripped from image URLs to preserve PNG transparency
- [x] Conveyor belt loops seamlessly (no visible jump at reset point)
- [x] Auto-scroll pauses on hover / focus-within, resumes on leave
- [x] `prefers-reduced-motion: reduce` disables auto-scroll entirely
- [x] Heading hierarchy: `h1` (hero) → `h2` (industry group names)
- [x] Screen reader: cloned cards are `aria-hidden="true"` and `tabindex="-1"`
- [x] No regressions on default projects-listing (tab/grid variant)

---

## Anything Else

- Each project page needs `industry` added to its Metadata table in da.live before it appears in the correct group. Pages without the field fall into "Other."
- After updating project page metadata, preview/publish the page in da.live, then re-index: `POST https://admin.hlx.page/index/AdobeDrago/drago-showcase/main/projects/{slug}`
- Logo images must be transparent PNGs for the white-filter treatment to work. JPEGs or PNGs with baked-in white backgrounds will render as white squares — replace those with transparent versions in da.live.
