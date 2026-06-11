# Troubleshooting - Resume Builder

## Common Issues & Fixes

### 1. Old resume content ("Jaswanth") is still showing on GitHub Pages
* **Cause**: Browsers strongly cache static HTML/JS assets served by GitHub Pages.
* **Fix**: Force a hard reload to clear cache:
  * Windows (Chrome/Edge/Firefox): Press **`Ctrl` + `F5`** or **`Shift` + `F5`**.
  * Mac (Safari/Chrome): Press **`Cmd` + `Shift` + `R`**.
  * Open in an **Incognito / Private** window to confirm.

### 2. Can't edit or delete a profile
* **Cause**: Default system profiles (Pravallika, Hardhik, Mounika) are write-protected in `app.js`.
* **Fix**: This is expected behavior. The edit and delete buttons will only be visible/active when a user-created custom profile is selected from the dropdown list.

### 3. Custom profiles disappeared
* **Cause**: Browser localStorage data was cleared, or you opened the app in a different browser.
* **Fix**: Profile configurations are stored on client-side cache. To keep profiles, avoid clearing site cookies/localStorage or running in private browsing tabs.
