# Getting Started & Project Setup

This guide helps you clone the repository and set up your local workspace environment.

---

## 📋 Prerequisites
To run the automated verification scripts, you must have the following installed on your machine:
- **Python 3.x** (Python 3.7 or newer is recommended).

No additional Python packages or database dependencies are needed. The scripts run natively using Python standard library components (`re`, `sys`, `pathlib`, `subprocess`).

---

## ⚙️ Initial Setup

1. **Clone/Download the Project**:
   Ensure all project files are located in your working directory:
   ```text
   resume_builder_app/
   ├── .validation/
   ├── docs/
   ├── app.js
   ├── index.html
   └── style.css
   ```

2. **Verify Installation**:
   Open a terminal, navigate to the project directory, and execute:
   ```bash
   python .validation/scripts/verify-layout.py
   ```
   **Expected Outcome**:
   ```text
   🔍 Layout & Architecture Verification
   ============================================================
   Checking: style.css...
   Checking: index.html...
   Checking: app.js...

   ============================================================
   ✅ Verification Successful! All layout checks passed.
   🎉 No architectural anti-patterns found.
   ```

3. **Open the App**:
   Double-click `index.html` to open the Candidates Portal directly in Google Chrome, Microsoft Edge, or Firefox.

---

## 🔄 Optional: Enable Git Pre-Commit Hook

To block commits automatically if any layout regressions are introduced:
1. Create a file at `.git/hooks/pre-commit` (no file extension).
2. Add the following code:
   ```bash
   #!/bin/bash
   echo "Running layout verification hook..."
   python .validation/scripts/verify-layout.py
   exit $?
   ```
3. Make the hook executable:
   ```bash
   chmod +x .git/hooks/pre-commit
   ```
