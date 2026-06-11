# Project Mode Guidelines - Resume Builder

## Coding Conventions
* **Vanilla Structure**: Write clean, dependency-free HTML/CSS/JS. Avoid injecting tailwind or libraries unless specifically requested.
* **Separation of Concerns**: Keep layout structures in `index.html`, styling definitions in `style.css`, and application logic in `app.js`.
* **State Proxy**: Enforce data bindings through the global `PROFILE` proxy to dynamically adapt values based on the selected dropdown profile.

## Layout & Styling Rules
* **bullet alignment**: Enforce custom `8pt` list bullet spacing and flex-based right date alignments.
* **mockup boundary**: Maintain symmetrical layout margins (`32pt` padding) and safety heights (`970px`).

## Validation Checklist
* Confirm that default profiles (Pravallika, Hardhik, Mounika) are protected and cannot be deleted or modified.
* Ensure localStorage CRUD operations update the UI immediately without creating duplicate candidate keys.
* Validate that generated DOCX filenames match the candidate name format.
