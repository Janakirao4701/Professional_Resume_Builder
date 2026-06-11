# CSS Layout Patterns

Use these CSS patterns to build clean, responsive, and print-safe resume mockups.

---

## 1. List Bullet Items (Hanging Indent)

### ❌ NEVER USE (Anti-Pattern)
Negative text-indents slide the bullets outside the main text box, causing them to clip outside the page border or margins.
```css
.mock-bullet {
  margin-left: 18pt;
  text-indent: -18pt; /* AVOID THIS */
}
```

### ✅ ALWAYS USE (Correct Pattern)
Use a Flexbox layout with a dedicated text span and a fixed bullet icon span to keep bullets contained within the page margins.
```css
.mock-bullet {
  display: flex !important;
  align-items: flex-start !important;
  margin-top: 3pt;
  margin-bottom: 3pt;
  line-height: 1.15;
  text-align: left;
  position: relative;
  width: 100%;
}

.mock-bullet::before {
  content: "•";
  margin-right: 8pt;
  flex-shrink: 0;
}
```
*Note: In our HTML resume builder mockup, we generate paragraphs dynamically and append a bullet character prefix or styling elements.*

---

## 2. Right-Aligned Dates & Role Layouts

### ❌ NEVER USE (Anti-Pattern)
Hardcoded absolute positioning breaks date alignments when users zoom in/out or when candidate names are longer.
```css
.mock-exp-header span:last-child {
  position: absolute;
  left: 450pt; /* AVOID THIS */
}
```

### ✅ ALWAYS USE (Correct Pattern)
Use Flexbox space-between on the header element to keep date entries pinned to the right edge dynamically.
```css
.mock-exp-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: baseline !important;
  font-weight: bold;
  font-size: 11pt;
  color: #000000;
  margin-top: 10pt;
  margin-bottom: 2pt;
  width: 100%;
}
```

---

## 3. Responsive Panel Layout (Stacked Viewport)
Ensure both panels remain visible and stack vertically on smaller viewports.

```css
@media (max-width: 1023px) {
  .app-workspace {
    display: flex !important;
    flex-direction: column !important;
    gap: var(--space-6) !important;
  }
  
  .editor-outer-shell, 
  .preview-outer-shell {
    display: flex !important;
    width: 100% !important;
    height: auto !important;
  }
}
```

---

## 4. Mobile Actions & Button Layouts
Ensure action buttons wrap or condense to avoid horizontal scrollbars on mobile.

```css
@media (max-width: 767px) {
  /* Hide text labels, show only action circles on mobile */
  .action-buttons .btn-dl span:not(.btn-icon-circle) {
    display: none !important;
  }

  .action-buttons .btn-dl {
    padding: 6px !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    justify-content: center !important;
  }
}
```
