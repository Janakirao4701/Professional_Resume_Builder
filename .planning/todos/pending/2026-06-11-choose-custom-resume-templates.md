---
created: 2026-06-11T19:10:14.538Z
title: Choose custom resume templates
area: ui
files:
  - index.html
  - style.css
  - app.js
---

## Problem

Currently, the resume builder renders a single fixed A4 mockup format (`#resume-mockup`). The user wants to support multiple custom templates (e.g., Clean, Modern, Classic, Minimalist) that candidates can select dynamically.

## Solution

1. Add a template selector dropdown in the workspace or main navbar.
2. Define CSS classes in `style.css` for each template layout (e.g., `.template-clean`, `.template-modern`, `.template-creative`).
3. Modify the template rendering logic in `app.js` (`updatePreview()`) to apply the selected class to `#resume-mockup`.
4. Ensure spacing, font styling, borders, and margins adapt dynamically based on the active template class.
5. Verify print styling works flawlessly for all layout themes.
