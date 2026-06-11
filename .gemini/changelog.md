# Changelog - Resume Builder

## [v1.2.0] - 2026-06-11
### Added
- Created the local `.gemini` settings directory inside the workspace containing `project-mode.md`, `architecture.md`, `tasks.md`, `decisions.md`, `changelog.md`, `deployment.md`, and `troubleshooting.md`.
- Implemented **Profile Editing** feature to allow modification of custom profile properties (Job Subtitle, Contact, Education, Certs) in-place without duplicating keys in localStorage.

## [v1.1.0] - 2026-06-10
### Fixed
- Resolved modal close method naming mismatch (`closeModal` vs `closeProfileModal`) causing JavaScript runtime exceptions.
- Hardcoded output filename logic modified to dynamically download as `[Candidate_Name]_Resume.docx`.

## [v1.0.0] - 2026-06-10
### Added
- Combined distinct candidate profile layouts into a single-app switcher.
- Added modal form interface to support custom profile additions, localStorage persistence, and custom deletion.
