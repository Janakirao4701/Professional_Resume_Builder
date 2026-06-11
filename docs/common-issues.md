# Common Layout Issues & Resolutions

This guide catalogs common styling and layout issues, explaining why they occur and how to fix them correctly.

---

## 💥 1. Bullets Escaping Container Boundaries
- **Symptom**: List bullet points or check icons are printed on top of the left borders or outside margins.
- **Root Cause**: Negative `text-indent` (e.g. `text-indent: -18pt`) was applied to the list container. This shifts the first line of text leftward relative to its block container boundaries.
- **Resolution**: Use Flexbox formatting on list elements:
  ```css
  .list-item {
    display: flex;
    align-items: flex-start;
  }
  .list-item::before {
    content: "•";
    margin-right: 8pt;
    flex-shrink: 0;
  }
  ```

---

## 📅 2. Dates Overlapping Text Content on Zoom
- **Symptom**: Job experience dates or graduation years overlap with company names when zooming in/out or changing text sizes.
- **Root Cause**: Hardcoded absolute left offsets (e.g., `position: absolute; left: 450pt;`) force text to stay in a fixed horizontal slot regardless of font scaling.
- **Resolution**: Replace absolute positions with Flexbox space-between alignment:
  ```css
  .row-container {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  ```

---

## 🖨️ 3. Blank PDF Pages or Content Overflow
- **Symptom**: Exporting to PDF creates extra blank pages at the end, or cuts off sentences at the bottom margin.
- **Root Cause**: Elements inside the print layout are using `height: 100%` or nested inner scrolling wrappers, which hide overflow content in print mode.
- **Resolution**: Ensure all main container elements have print styles override to use `height: auto` and `overflow: visible`:
  ```css
  @media print {
    .preview-pane, .preview-wrap, #resume-mockup {
      display: block !important;
      height: auto !important;
      overflow: visible !important;
    }
  }
  ```
