# Pre-Commit Quality Checklist

Perform these checks before staging and committing any code modifications.

---

## 🤖 1. Automated Checks (Must Pass)

Run the layout verification script from your project root:
```powershell
python .validation/scripts/verify-layout.py
```
**Expectation**: All checks must pass with exit code `0`. If any violations are found, fix them before proceeding.

---

## 👁️ 2. Manual Checklist (2 Minutes)

Open `index.html` in Chrome or Edge and perform a quick visual review:

- [ ] **Desktop Split View Check**: Ensure the Editor occupies the left and the Preview occupies the right.
- [ ] **Responsive Stacking Check**: Resize your browser viewport to under `1024px`. Ensure both panels stack vertically with no tabs.
- [ ] **Mobile Header Check**: Resize your viewport to under `768px`. Verify that the header remains under `100px` height and the download/backup buttons become circles.
- [ ] **Zoom Test**: Zoom your browser to `50%`, `100%`, and `150%`. Ensure dates stay on the right and bullets stay within the page borders.
- [ ] **Real-time Synchronization Check**: Edit text in the editor pane and confirm the preview scales and updates immediately.
- [ ] **Console Inspection**: Open DevTools (`F12`) and confirm there are no red syntax or execution errors in the Console tab.
