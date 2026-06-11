# Resume Markup Structure Standards

This document describes the resume formatting tags and formatting guidelines used by the Resume Builder parsing engine.

---

## 🏷️ Content Tag Identifiers

The editor parser parses the plain text input into specific segments by matching uppercase headings surrounded by square brackets.

| Target Tag | Section Generated |
|---|---|
| `[SUMMARY]` or `[PROFESSIONAL SUMMARY]` | Professional Summary block |
| `[SKILLS]` or `[TECHNICAL SKILLS]` | Bulleted Technical Skills list |
| `[EXPERIENCE]` or `[PROFESSIONAL EXPERIENCE]` | Work history blocks with company/role lines |

---

## 📝 Parsing Syntax Rules

### 1. Work History Format
Every job entry in `[PROFESSIONAL EXPERIENCE]` must be declared as a pipe-separated line followed by bullet details.

**Format (4-part):**
`Company Name | Location | Role Title | Dates`
*Example:*
`Google | Mountain View, CA | Senior software Engineer | 2024 - Present`

**Format (3-part):**
`Company Name | Role Title | Dates`
*Example:*
`Netflix | Frontend Engineer | 2022 - 2024`

### 2. Bullet Lists
Bullets in Technical Skills and Professional Experience sections must start with a bullet character:
- `- ` (hyphen-space)
- `• ` (bullet-space)
- `* ` (asterisk-space)

*Example:*
```text
- Programmed Allen-Bradley ControlLogix PLCs for material handling.
- Optimized Cognex inspection vision cameras to scan VIN barcodes.
```

---

## 🎓 Profile Form Modal Schema

When adding or editing a candidate profile, the following data must be provided:
- **Full Name**: Candidate's display name
- **Job Subtitle**: Core profession / title
- **Email, Phone, Location, LinkedIn**: Standard contact details
- **Education entries**: School name, Degree, Dates, and Location (supports up to 2 degrees)
- **Certifications**: Comma-separated strings
- **Raw Resume Text**: Seed text parsed into the editor on profile load
