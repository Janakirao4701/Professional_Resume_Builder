# Technical Troubleshooting & Debugging Guide

This guide describes how to troubleshoot layout validation scripts and debug visual regressions.

---

## 🛠️ 1. Verification Script Fails
If running `python .validation/scripts/verify-layout.py` reports violations:

1. **Locate the Error**:
   The output flags the file name and the exact line number of the violation:
   ```text
   ❌ Verification Failed: Found 1 violation(s)!

     [style.css:1240] Rule: no-negative-text-indent
     Violation: Negative text-indent detected. This clips bullets outside borders. Use Flexbox layout patterns instead.
     Reference: .validation/patterns/css-layouts.md#1-list-bullet-items-hanging-indent
   ```
2. **Apply the Fix**:
   Open the highlighted file at the specified line number and refactor the style using the Flexbox layout patterns detailed in [.validation/patterns/css-layouts.md](file:///c:/Users/janak/Downloads/resume_builder_app/.validation/patterns/css-layouts.md).
3. **Re-run the Script**:
   Verify that the script now exits with `0` successfully.

---

## 🌐 2. Browser Visual Debugging
To inspect layout alignment and margins:

1. **Activate Developer Tools**:
   Press `F12` (or right-click any element and select **Inspect**) in your browser.
2. **Review Elements**:
   Hover over the `.preview-page` elements to inspect their actual box model:
   - Margins: Should be `0` inside the print layout.
   - Padding: Should be `32pt` symmetrically.
   - Border: The `.mock-page-border` must align exactly at `24pt` from the edges.
3. **Zoom Simulation**:
   Use the browser zoom feature (`Ctrl` + `+` or `Ctrl` + `-`) to simulate scaling. Verify that:
   - Text wraps naturally within the `.preview-page` container.
   - Spacers and text do not break outside the borders.

---

## 🖨️ 3. Print Layout (PDF) Debugging
If the printed PDF layout differs from the live browser preview:

1. **Verify Emulated CSS Media**:
   - In Chrome DevTools, click the three-dots menu -> **More tools** -> **Rendering**.
   - Under **Emulate CSS media type**, select **print**.
   - This emulates the print layout directly on the screen, letting you inspect the styles applying to `@media print`.
2. **Check Page Boundaries**:
   Ensure page-break properties are configured:
   - `.preview-page` has `page-break-after: always !important`.
   - The last page has `page-break-after: avoid !important`.
