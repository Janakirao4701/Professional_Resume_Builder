# Task List — UI Audit Fixes

- [x] Phase 1: Accessibility (a11y) & Interactive States
  - [x] Add `type="button"` to all static and dynamic buttons in `builder.html`, `app.js`, `js/parser.js`, and `js/ui.js`
  - [x] Fix drawer dynamic `aria-hidden` and `aria-expanded` attributes in `app.js`
  - [x] Simplify drawer close button `aria-label` in `builder.html`
  - [x] Restore focus outlines for `#jd-text` and `#resume-text` textareas in `style.css`

- [x] Phase 2: Layout & Responsiveness
  - [x] Increase desktop grid columns to `500px 1fr` in `style.css`
  - [x] Apply `flex-wrap: nowrap` to header and profile pill in `style.css`
  - [x] Adjust preview scale and add dynamic negative margins in `js/preview.js`

- [x] Phase 3: Button Radiuses, Download Styles & Theme Variables
  - [x] Remove inline styles from `#analyze-btn`, `#step4-paste-btn`, `.editor-word-count`, and `.jd-word-count` in `builder.html`
  - [x] Define `.btn-step4-paste`, `.editor-word-count`, and `.jd-word-count` in `style.css`
  - [x] Unify button corner-radiuses in `style.css`
  - [x] Make DOCX button filled blue to match PDF button in `style.css`
  - [x] Clean up hover transitions on `.double-bezel-outer` and fix monospace font stack in `style.css`
  - [x] Increase text size and contrast for AI step labels and zone subtitles in `style.css`

- [x] Phase 4: Dynamic Accordion & Mobile Actions
  - [x] Add "Rename Profile" to mobile drawer in `builder.html`
  - [x] Add `triggerMobileRename()` in `app.js`
  - [x] Transition accordion heights using scrollHeight in `app.js` and remove height constraints in `style.css`

- [x] Phase 5: Theme Toggle Icon State
  - [x] Update `updateThemeToggleIcon()` in `js/ui.js` to reflect active theme state
