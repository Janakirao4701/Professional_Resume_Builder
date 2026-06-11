# Resume Builder Portal - Simple Architecture

This project is a Resume Builder candidates portal that generates clean, professional, print-safe resumes. 

---

## 🎯 Architecture Philosophy

We use a simple verification architecture:
- **Human-Readable**: All patterns and checklists are written in Markdown files that any developer can read in 2 minutes.
- **Enforced**: Local Python scripts automatically scan the workspace for visual and layout regressions.
- **Minimalist**: No heavy JSON configs or complex abstractions.

---

## 🚀 How to Run Quality Checks

Before you commit any changes, run the automated layout verification script:
```bash
python .validation/scripts/verify-layout.py
```

It checks for common anti-patterns like:
- Negative `text-indent` properties that cause bullets to escape boundaries.
- Absolute positioning on resume dates that breaks zoom.
- Incorrect layout flexbox definitions on bullet elements.

### ⚓ Automated Quality Gates

This project enforces these layout rules automatically:
1. **Local Git Pre-Commit Hook**: A pre-commit hook is set up at `.git/hooks/pre-commit` to automatically run verification checks before any commit is processed. If checks fail, the commit is blocked until resolved.
2. **GitHub Actions CI/CD**: A workflow at `.github/workflows/validate.yml` automatically executes the validation script on every branch push or pull request on GitHub, preventing broken layouts from being merged.

---

## 📁 Directory Structure

- **`.validation/`**: Internal configuration, checklists, scripts, and layout patterns.
  - **`patterns/`**: Standard CSS/HTML layout rules.
  - **`checklists/`**: Pre-commit and pre-deployment checklists.
  - **`scripts/`**: Layout validation scripts.
- **`docs/`**: Reference guides for developers and QA engineers.

---

## 📖 Helpful Links
- Technical architecture details: [.validation/architecture.md](file:///c:/Users/janak/Downloads/resume_builder_app/.validation/architecture.md)
- Flexbox bullet layout patterns: [.validation/patterns/css-layouts.md](file:///c:/Users/janak/Downloads/resume_builder_app/.validation/patterns/css-layouts.md)
- Quick Pre-Commit checklist: [.validation/checklists/before-commit.md](file:///c:/Users/janak/Downloads/resume_builder_app/.validation/checklists/before-commit.md)
- Common layout bugs and fixes: [docs/common-issues.md](file:///c:/Users/janak/Downloads/resume_builder_app/docs/common-issues.md)
