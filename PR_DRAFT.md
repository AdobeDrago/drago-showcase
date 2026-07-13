Fix #<gh-issue-id>

**projects-listing: pagination, Hold label, dynamic stat count**

- Dynamic project count in stat card — `columns.js` listens for a `projects:loaded` event dispatched by `projects-listing` and updates the "Projects" stat live, so it always reflects the actual total from da.live rather than a hardcoded value.
- "Not started" renamed to "Hold" across the filter tab and status badge.
- 9-card pagination with show more/less toggle — projects-listing shows the first 9 cards per active filter; a "Show N more" button reveals the rest and collapses back. Filter switches always reset to the first 9.

Test URLs:
- Before: https://main--drago-showcase--AdobeDrago.aem.page
- After: https://homepage-design--drago-showcase--AdobeDrago.aem.page
