# feat: Homepage visual overhaul — hero, nav, and stats bar

Fix #<gh-issue-id>

**Test URLs:**
| | URL |
|---|---|
| Before | https://main--drago-showcase--adobedrago.aem.page |
| After | https://\<branch\>--drago-showcase--adobedrago.aem.page |

---

## What

Complete visual redesign of the drago-showcase homepage across three surface areas:

- **Hero block** — Responsive character image anchored to the right side of the hero at all screen sizes, with the yellow waistband consistently touching the hero's bottom edge. Brand name "Drago" highlighted in red in the hero headline.
- **Navigation** — Right-justified nav links, increased height (64px → 80px), bottom border separator, larger brand wordmark, and red accent on "Drago" in the nav brand.
- **Stats bar (columns block)** — Redesigned from a plain list into a row of KPI cards — each stat in a rounded-rectangle card with yellow numbers, grey labels, and proportionate padding.

---

## Why

The site launched with minimal placeholder styles. This iteration establishes the brand identity for the Drago showcase:

- The hero needed the character image visible above the dark background (a z-index stacking context issue) and correctly sized/cropped across breakpoints.
- The nav lacked visual separation from page content and brand emphasis.
- The stats bar had no visual hierarchy — numbers and labels rendered identically, and the section had a mismatched background color creating a visible gap between sections.

---

## How

### Hero (`blocks/hero/hero.css`, `blocks/hero/hero.js`)

- Added `isolation: isolate` to `.hero` to create a stacking context, allowing `z-index: -1` on the `<picture>` to render above the page background but below text.
- Used `position: absolute; bottom: 0; height: 125%; transform: translateY(20%)` on `img` to anchor the character's waistband at the hero bottom regardless of screen size. `translateY(Y%)` is always `Y%` of the element's own height — with the waistband at ~20% from the image bottom, this is mathematically stable at any viewport width.
- Added breakpoints at 600px, 900px, 1440px, 1920px, and 2560px to progressively adjust font size, padding, and picture element left-offset as the layout widens.
- JS injects `<span class="hero-brand-accent">` around "Drago" in the `h1` and groups multiple button containers into a flex row.

### Navigation (`blocks/header/header.css`, `blocks/header/header.js`)

- `flex: 0 0 auto; margin-left: auto` on `.nav-sections` at 900px+ pushes links to the right.
- Nav height token increased to 80px; `border-bottom` separator added.
- JS injects `<span class="nav-brand-accent">` around "Drago" in the brand anchor link.

### Stats bar (`blocks/columns/columns.css`)

- Rewrote the columns layout as a flex row of equally-sized cards. DA Live renders stat numbers as `<h1>` and labels as `<h4>` — selectors target those elements specifically.
- Numbers: `color: var(--color-accent-yellow); font-size: 38–40px; font-weight: 700`
- Labels: `color: var(--dark-color); font-size: var(--body-font-size-s); font-weight: 400`
- Cards: `border: 1px solid var(--color-border); border-radius: 6px; padding: 24–28px`
- At 600px cards wrap 2-per-row; at 900px all four appear in a single row.

### Section gap fix (`styles/styles.css`)

- `main .section.highlight:has(+ .section) { padding-bottom: 0 }` removes the hero section's 40px bottom padding when directly followed by the stats section.
- `main .section.highlight + .section { margin-top: 0; padding-top: 32px }` removes the default top margin on the stats section.
- `highlight` sections now use `var(--background-color)` instead of `var(--light-color)` to eliminate the subtle color strip between the two sections.

---

## Testing

- [x] Mobile (375px): hero text readable, character visible, waistband at hero bottom, stats cards stack 2×2
- [x] Tablet (768px): hero proportions correct, cards wrap cleanly
- [x] Desktop (1280px): all four stat cards in a single row, nav links right-justified, image fills right side of hero
- [x] Large desktop (1440px): character scales up, face and glove remain in frame, waistband still at bottom
- [x] No visible gap or color strip between hero and stats sections at any breakpoint
- [x] "Drago" brand accent (red) renders in both nav and hero headline

---

## Screenshots

> Attach before/after screenshots for: mobile hero, desktop hero, stats bar, nav bar

---

## Anything Else

- All changes are confined to block-level CSS/JS and global `styles.css` — no changes to content, templates, or `aem.js` utilities.
- The `translateY` approach for waistband anchoring is intentional and well-commented in `hero.css` — it is mathematically stable and does not require per-breakpoint pixel tuning.
- If the character image changes in DA, the `translateY` percentage may need adjustment based on where the new image's waistband sits relative to its bottom edge.
