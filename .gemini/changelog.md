# Changelog - Resume Builder

## [v1.3.0] - 2026-06-11
### Changed
- Removed default hardcoded candidate profiles (Pravallika, Hardhik, Mounika) to support starting with a clean empty database.
- Enabled edit/delete features for all profiles since all profiles are now custom profiles.
- Updated export backup filename layout to dynamically save as `[Profile_Name]_backup.json`.
- Implemented safety alerts for PDF and DOCX downloads when no candidate profile exists.
- Fixed split-screen and mobile layout responsiveness by converting header action buttons to dynamic icons on narrow screens, restricting dropdown selector width, and enabling side-by-side editing starting at 768px width.

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
