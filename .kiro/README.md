# Resume Builder Portal - Simple Architecture

This project is a Resume Builder candidates portal that generates clean, professional, print-safe resumes. 

---

## 🎯 Architecture Philosophy

We use the `.kiro` simple architecture:
- **Human-Readable**: All patterns and checklists are written in Markdown files that any developer can read in 2 minutes.
- **Enforced**: Local Python scripts automatically scan the workspace for visual and layout regressions.
- **Minimalist**: No heavy JSON configs or complex abstractions.

---

## 🚀 How to Run Quality Checks

Before you commit any changes, run the automated layout verification script:
```bash
python .kiro/scripts/verify-layout.py
```

It checks for common anti-patterns like:
- Negative `text-indent` properties that cause bullets to escape boundaries.
- Absolute positioning on resume dates that breaks zoom.
- Incorrect layout flexbox definitions on bullet elements.

---

## 📁 Directory Structure

- **`.kiro/`**: Internal configuration, checklists, scripts, and layout patterns.
  - **`patterns/`**: Standard CSS/HTML layout rules.
  - **`checklists/`**: Pre-commit and pre-deployment checklists.
  - **`scripts/`**: Layout validation scripts.
- **`docs/`**: Reference guides for developers and QA engineers.

---

## 📖 Helpful Links
- Technical architecture details: [.kiro/architecture.md](file:///c:/Users/janak/Downloads/resume_builder_app/.kiro/architecture.md)
- Flexbox bullet layout patterns: [.kiro/patterns/css-layouts.md](file:///c:/Users/janak/Downloads/resume_builder_app/.kiro/patterns/css-layouts.md)
- Quick Pre-Commit checklist: [.kiro/checklists/before-commit.md](file:///c:/Users/janak/Downloads/resume_builder_app/.kiro/checklists/before-commit.md)
- Common layout bugs and fixes: [docs/common-issues.md](file:///c:/Users/janak/Downloads/resume_builder_app/docs/common-issues.md)
