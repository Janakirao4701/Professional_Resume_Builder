# Deployment - Resume Builder

## Environments
* **Development**: Workspace directory at `C:\Users\janak\.gemini\antigravity-ide\scratch\resume-builder\`.
* **Testing / Local Run**: Deployment directory at `C:\Users\janak\Downloads\resume_builder_app\`.
* **Production**: GitHub Pages deployment at `https://janakirao4701.github.io/Resume_builder/`.

## Publish Steps
1. Copy updated files (`index.html`, `style.css`, `app.js`) to the deployment folder:
   ```powershell
   Copy-Item -Path "C:\Users\janak\.gemini\antigravity-ide\scratch\resume-builder\*" -Destination "C:\Users\janak\Downloads\resume_builder_app\" -Force
   ```
2. Navigate to `C:\Users\janak\Downloads\resume_builder_app\`, check git status, stage, commit, and push:
   ```bash
   git add .
   git commit -m "feat: <deployment details>"
   git push origin main
   ```
3. Wait 1-2 minutes for the GitHub Pages build action to complete.
