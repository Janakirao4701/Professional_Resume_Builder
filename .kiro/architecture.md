# Resume Builder - Project Architecture & Technical Decisions

This document logs key design and layout decisions made for the Candidates Portal.

---

## 🏗️ Tech Stack
- **Languages**: HTML5, Vanilla CSS3, Javascript (ES6).
- **Libraries**: `docx.js` (client-side Word export), standard browser printing (`window.print()`) for PDF export.
- **Backend**: Client-side only. All candidate profiles are persisted locally in `localStorage` (`custom_resume_profiles`).

---

## 🎨 Key Layout Decisions

### 1. Flexbox vs Negative Text-Indent for Bullets
- **Problem**: Traditional list-bullet alignment using negative `text-indent` (e.g. `margin-left: 18pt; text-indent: -18pt;`) makes bullets slide outside the container boundaries. When custom borders or padding are applied to pages, the bullets render over the margins, breaking the resume design.
- **Solution**: We use a two-span Flexbox structure for all list bullets:
  - `.mock-bullet` uses `display: flex; align-items: flex-start;`
  - `.bullet-dot` (or prefix) has `width` and `flex-shrink: 0`
  - `.bullet-text` has `flex: 1`
  - This guarantees bullets remain aligned and contained inside the margins.

### 2. Flexbox space-between vs Absolute Positioning for Dates
- **Problem**: Hardcoding absolute left properties for date positions (e.g., `position: absolute; left: 450px;`) causes overlap regressions when text fonts scale or when the browser zoom level is modified.
- **Solution**: We use `display: flex; justify-content: space-between; align-items: baseline;` for all experience/education lines. The role/company stays on the left and the date aligns on the right, dynamically adapting to any viewport scale.

### 3. Desktop Split View & Mobile Vertical Stacking
- **Desktop (>= 1024px)**: Fixed side-by-side grid view where the Editor panel is fixed on the left and the Preview is fluid on the right.
- **Tablet & Mobile (< 1024px)**: Reverted previous tabbed view to keep both panels fully visible in the DOM. Stacking them vertically ensures a continuous, non-interruptive workflow (edit above, scroll slightly to view changes) and prevents scaling bugs on load.

---

## 🖨️ PDF & Print Specifications
- **Page Dimensions**: US Letter size (`8.5in` x `11in` or `816px` x `1056px`).
- **Page Borders**: A `0.5pt` single border aligned at `24pt` from page edges.
- **Content Padding**: Symmetrical `32pt` padding to keep resume contents within page boundaries.
- **Dynamic Pagination**: Built-in script dynamically splits sections and creates a new `.preview-page` element when height exceeds `970px`, ensuring clean page breaks and preventing vertical cutoffs.

---

## 🔍 Code Enforcement
To ensure these layout decisions are not broken during refactors, we enforce:
- Regular local runs of `.kiro/scripts/verify-layout.py`.
- No inline styles on list bullets.
- Strict CSS linting rules.
