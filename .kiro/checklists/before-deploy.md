# Pre-Deployment Verification Checklist

Perform these checks before pushing code changes to the production branch (or deploying to GitHub Pages).

---

## 🏗️ 1. Verification of Build Assets

- [ ] **Styles Cache Busting**: Ensure the style stylesheet link in `index.html` matches the latest version. Update the suffix if you made CSS changes:
  ```html
  <link rel="stylesheet" href="style.css?v=1.3">
  ```
- [ ] **Library Access**: Verify that external scripts (such as `docx.js` via jsDelivr CDN) load correctly in online viewports.
- [ ] **No Local Testing Artifacts**: Ensure all mock JSON files or testing mockups are removed and only standard candidate profiles remain in `localStorage`.

---

## 📑 2. Export Generation Verification

- [ ] **PDF Export Layout**: Click **Download PDF** (triggers browser printing). Verify that:
  - Margins and borders match the print specification (24pt border, 32pt padding).
  - Page breaks split cleanly without cutting sentences or tables in half.
  - Symmetrical page margins are kept on all sheets.
- [ ] **DOCX Export Layout**: Click **Download DOCX** and open the downloaded document in MS Word or Google Docs. Verify that:
  - Text, spacing, dates, and bullets render without overlap.
  - The tables match standard margins.
- [ ] **Backup Portability**: Test the **Export Backup** feature, clear the browser cache, select **Import Backup**, and verify that all candidates, profiles, and editor texts restore correctly.
