# Architecture - Resume Builder

## Folder Structure
```
resume-builder/
├── .gemini/             # Project IDE settings
│   ├── current-context.md
│   ├── project.md
│   └── ...
├── index.html           # Document layout and profile modal markup
├── style.css            # Symmetrical spacing rules and modal popups
└── app.js               # Proxy binder, CRUD triggers, and DOCX packers
```

## Data Persistence (localStorage)
* **Custom Profiles**: Stored under key `custom_resume_profiles` as a serialized object mapping unique profile IDs to their config structures.
* **Schema**:
```json
{
  "custom_jane_smith_17811": {
    "profile": {
      "name": "Jane Smith",
      "subtitle": "PLC Programmer",
      "email": "jane@example.com",
      "phone": "+1 234 567",
      "location": "Houston, TX",
      "linkedin": "linkedin.com/in/janesmith",
      "education": [
        { "degree": "M.S.", "dates": "2020-2022", "school": "UH", "location": "Houston" }
      ],
      "certs": ["AWS"]
    },
    "text": "[PROFESSIONAL SUMMARY]\n..."
  }
}
```

## State & Rendering Flow
1. **Initial Load**:
   * Fetch `localStorage` and merge custom profiles with default `HARDCODED_PROFILES`.
   * Populate dropdown selector and load the active candidate's cached resume text.
2. **Proxy Access**:
   * Calls to properties on the global constant `PROFILE` (e.g. `PROFILE.name`) are intercepted and directed to the active candidate configuration.
3. **Change Detection**:
   * Text changes trigger `detectSectionsAndCompanies()` and `updatePreview()` to render the PDF-mockup view in real-time.
