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

1. **Add Customization Controls**:
   - Add dropdown selectors in the UI for:
     - **Layout Template** (Classic, Modern, Minimalist)
     - **Font Family** (Serif, Sans-serif, Monospace)
     - **Font Size** (10pt, 11pt, 12pt)
     - **Page Margins** (Compact: 24pt, Normal: 32pt, Spacious: 40pt)
2. **Expose Controls in UI**:
   - Place selection controls inside the sidebar panel or a settings submenu in the mobile slide-out menu / desktop header.
3. **Dynamic Style Mapping in CSS**:
   - Define utility classes in `style.css` matching selection states:
     - Font family classes (e.g., `.font-serif`, `.font-sans`, `.font-mono`) applying specific stacks.
     - Sizing classes (e.g., `.size-10pt`, `.size-11pt`, `.size-12pt`) scaling base font sizes.
     - Spacing classes (e.g., `.margin-compact`, `.margin-normal`, `.margin-spacious`) scaling `.preview-page` padding values.
4. **JS Preview Renderer Integration**:
   - In `app.js` (`updatePreview()`), dynamically append all chosen customization tags (e.g., `class="template-modern font-sans size-11pt margin-normal"`) to `#resume-mockup` and page wrapper elements before page height calculations occur.
5. **Print Styles Compatibility**:
   - Ensure print media styles inherit these variables accurately for output mapping in PDF exports.
