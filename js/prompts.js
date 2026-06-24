// ── AI ASSISTANT PROMPT TEMPLATES MODULE ──

import { activeProfile } from './state.js';
import { showToast } from './ui.js';

export const PROMPT_TEMPLATES = {
  software_engineer: 'resume_prompts/software_engineer_prompt.md',
  python_developer: 'resume_prompts/python_developer_prompt.md',
  java_developer: 'resume_prompts/java_developer_prompt.md',
  dotnet_developer: 'resume_prompts/dotnet_developer_prompt.md',
  devops_engineer: 'resume_prompts/devops_engineer_prompt.md',
  data_engineer: 'resume_prompts/data_engineer_prompt.md',
  data_analyst: 'resume_prompts/data_analyst_prompt.md',
  business_analyst: 'resume_prompts/business_analyst_prompt.md',
  automation_engineer: 'resume_prompts/automation_engineer_prompt.md',
  controls_engineer: 'resume_prompts/controls_engineer_prompt.md',
  plc_controls_engineer: 'resume_prompts/plc_controls_engineer_prompt.md',
  universal_resume: 'resume_prompts/universal_resume_prompt.md'
};

export let currentPromptTemplateText = "";

export async function loadSelectedPrompt() {
  const select = document.getElementById('ai-role-select');
  const preview = document.getElementById('ai-prompt-preview');
  if (!select || !preview) return;

  const role = select.value;
  if (!role) {
    currentPromptTemplateText = "";
    preview.value = "";
    return;
  }

  const filePath = PROMPT_TEMPLATES[role];
  if (!filePath) {
    showToast("Invalid prompt template path.");
    return;
  }

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load prompt: ${response.statusText}`);
    }
    const templateText = await response.text();
    currentPromptTemplateText = templateText;
    updateCombinedPromptPreview();
  } catch (err) {
    console.error(err);
    if (window.location.protocol === 'file:') {
      showToast("CORS Restriction: Cannot fetch templates on file:// protocol.");
      preview.value = "CORS Restriction:\nBrowsers block fetching local files (file://) due to security policies.\n\nTo load templates successfully, please run a local development server:\n1. Open your terminal in this directory\n2. Run: python -m http.server 8000\n3. Navigate to: http://localhost:8000/";
    } else {
      showToast("Error loading prompt template.");
      preview.value = "Error loading template: " + err.message + "\n\nPlease ensure the file exists at: " + filePath;
    }
  }
}

export function updateCombinedPromptPreview() {
  const preview = document.getElementById('ai-prompt-preview');
  if (!preview) return;

  if (!currentPromptTemplateText) {
    preview.value = "Select a role above to generate the AI prompt…";
    return;
  }

  preview.value = generateCombinedPrompt();
}

export function generateCombinedPrompt() {
  const currentResumeText = document.getElementById('resume-text').value.trim();

  let metadata = `
---

### BASE RESUME TO REWRITE:

**CANDIDATE INFORMATION:**
Name: ${activeProfile.name || ''}
Professional Title: ${activeProfile.subtitle || ''}
Email: ${activeProfile.email || ''}
Phone: ${activeProfile.phone || ''}
Location: ${activeProfile.location || ''}
LinkedIn: ${activeProfile.linkedin || ''}

**EDUCATION:**
`;

  const education = activeProfile.education || [];
  if (education.length > 0) {
    education.forEach(e => {
      metadata += `- ${e.degree || ''} | ${e.school || ''} | ${e.dates || ''} | ${e.location || ''}\n`;
    });
  } else {
    metadata += `(None listed)\n`;
  }

  metadata += `\n**CERTIFICATIONS:**\n`;
  const certs = activeProfile.certs || [];
  if (certs.length > 0) {
    certs.forEach(c => {
      if (c && c.trim()) {
        metadata += `- ${c}\n`;
      }
    });
  } else {
    metadata += `(None listed)\n`;
  }

  metadata += `
**PROFESSIONAL EXPERIENCE:**
${currentResumeText || '(None listed)'}
`;

  return `${currentPromptTemplateText}\n${metadata}`;
}

export async function copyAIPrompt() {
  const preview = document.getElementById('ai-prompt-preview');
  const btn = document.getElementById('btn-copy-prompt');
  if (!preview || !btn || !currentPromptTemplateText) {
    showToast("No prompt to copy. Select a role first.");
    return;
  }

  const combinedPrompt = generateCombinedPrompt();

  try {
    await navigator.clipboard.writeText(combinedPrompt);
    showToast("AI Prompt copied to clipboard!");
    
    btn.classList.add('copied');
    const span = btn.querySelector('span');
    const originalText = span.textContent;
    span.textContent = "✓ Copied!";
    
    setTimeout(() => {
      btn.classList.remove('copied');
      span.textContent = originalText;
    }, 2000);
  } catch (err) {
    console.error(err);
    showToast("Failed to copy prompt. Please copy manually from the preview.");
  }
}

// Bind to window for html use
window.updateCombinedPromptPreview = updateCombinedPromptPreview;
