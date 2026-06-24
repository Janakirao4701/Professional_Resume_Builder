// ── MULTI-PROFILE STORAGE AND MANAGEMENT ──
let profiles = {};
let currentProfileId = 'default';
let PROFILE = {};

const PROMPT_TEMPLATES = {
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

// Hardcoded Default Profile as fallback
const DEFAULT_PROFILE_DATA = {
  profile: {
    name:     'John Doe',
    subtitle: 'Professional Title',
    email:    'john.doe@email.com',
    phone:    '+1 (123) 456-7890',
    location: 'City, Country',
    linkedin: 'linkedin.com/in/johndoe',
    education: [
      { degree: 'Degree Name', dates: 'Start – End Date', school: 'University/Institution Name', location: 'Location' }
    ],
    certs: []
  },
  text: `[PROFESSIONAL SUMMARY]
A brief summary of your professional background, key expertise, and accomplishments.

[TECHNICAL SKILLS]
Core Competencies: Skill 1, Skill 2, Skill 3, Skill 4.
Tools & Technologies: Tool A, Tool B, Tool C, Tool D.

[PROFESSIONAL EXPERIENCE]
Company Name | Location | Job Title | Dates
- Developed and deployed key systems, improving efficiency by 20%
- Collaborated with cross-functional teams to deliver high-quality projects`
};

function saveToStorage() {
  localStorage.setItem('resume_builder_profiles', JSON.stringify(profiles));
}

function upgradeAllProfiles() {
  if (!profiles || typeof profiles !== 'object') {
    profiles = { default: JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA)) };
  }
  Object.keys(profiles).forEach(id => {
    let p = profiles[id];
    if (!p || typeof p !== 'object') {
      profiles[id] = { profile: {}, text: '' };
      p = profiles[id];
    }
    if (!p.profile || typeof p.profile !== 'object') {
      p.profile = {};
    }
    if (!p.profile.education || !Array.isArray(p.profile.education)) {
      p.profile.education = [];
    }
    if (!p.profile.certs || !Array.isArray(p.profile.certs)) {
      p.profile.certs = [];
    }
    
    // Reconstruct tags text from drawer summary/skills if the text box doesn't have the tags yet
    const rawText = p.text || '';
    const hasSummaryTag = rawText.includes('[SUMMARY]') || rawText.includes('[PROFESSIONAL SUMMARY]');
    const hasSkillsTag = rawText.includes('[SKILLS]') || rawText.includes('[TECHNICAL SKILLS]');
    
    if (!hasSummaryTag && !hasSkillsTag && (p.profile.summary || p.profile.skills)) {
      let newText = "";
      if (p.profile.summary) {
        newText += `[PROFESSIONAL SUMMARY]\n${p.profile.summary.trim()}\n\n`;
      }
      if (p.profile.skills) {
        newText += `[TECHNICAL SKILLS]\n${p.profile.skills.trim()}\n\n`;
      }
      if (rawText) {
        if (rawText.includes('[EXPERIENCE]') || rawText.includes('[PROFESSIONAL EXPERIENCE]')) {
          newText += rawText.trim();
        } else {
          newText += `[PROFESSIONAL EXPERIENCE]\n${rawText.trim()}`;
        }
      }
      p.text = newText;
      delete p.profile.summary;
      delete p.profile.skills;
    }
  });
}

function initProfiles() {
  const stored = localStorage.getItem('resume_builder_profiles');
  const storedId = localStorage.getItem('resume_builder_current_profile_id');
  
  if (stored) {
    try {
      profiles = JSON.parse(stored);
    } catch(e) {
      console.error("Failed to parse profiles from localStorage, using default.");
      profiles = { default: JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA)) };
    }
  } else {
    profiles = { default: JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA)) };
  }
  
  if (!profiles || typeof profiles !== 'object' || Object.keys(profiles).length === 0) {
    profiles = { default: JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA)) };
  }
  
  // Migrate profiles to tagless format
  upgradeAllProfiles();
  
  if (storedId && profiles[storedId]) {
    currentProfileId = storedId;
  } else {
    currentProfileId = Object.keys(profiles)[0] || 'default';
  }
  
  if (!profiles[currentProfileId]) {
    currentProfileId = Object.keys(profiles)[0] || 'default';
  }
  
  if (!profiles[currentProfileId]) {
    profiles[currentProfileId] = JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA));
  }
  
  PROFILE = profiles[currentProfileId].profile;
  
  // Set textarea content
  const textarea = document.getElementById('resume-text');
  if (textarea) {
    textarea.value = profiles[currentProfileId].text || '';
  }
  
  updateProfileSelectDropdown();
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreview();
}

function updateProfileSelectDropdown() {
  const select = document.getElementById('profile-select');
  const optionsHtml = Object.keys(profiles).map(id => {
    return `<option value="${id}" ${id === currentProfileId ? 'selected' : ''}>${escHtml(id)}</option>`;
  }).join('');
  
  if (select) {
    select.innerHTML = optionsHtml;
  }
  
  const mobileSelect = document.getElementById('mobile-profile-select');
  if (mobileSelect) {
    mobileSelect.innerHTML = optionsHtml;
  }
}

function switchProfile(profileId) {
  // Save current textarea content to active profile
  const textareaVal = document.getElementById('resume-text').value;
  profiles[currentProfileId].text = textareaVal;
  
  // Switch
  currentProfileId = profileId;
  PROFILE = profiles[currentProfileId].profile;
  localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
  saveToStorage();
  
  // Sync select dropdowns
  const select = document.getElementById('profile-select');
  if (select) select.value = currentProfileId;
  const mobileSelect = document.getElementById('mobile-profile-select');
  if (mobileSelect) mobileSelect.value = currentProfileId;
  
  // Update UI
  document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreview();
}

function createNewProfile() {
  const name = prompt("Enter a label/identifier for the new profile (e.g. 'Software_Engineer'):");
  if (!name) return;
  const cleanLabel = name.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
  if (!cleanLabel) { showToast("Invalid profile label. Use letters, numbers, underscores, or hyphens."); return; }
  if (profiles[cleanLabel]) { showToast("A profile with that label already exists."); return; }
  
  profiles[cleanLabel] = {
    profile: {
      name: '',
      subtitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      education: [],
      certs: []
    },
    text: `[PROFESSIONAL SUMMARY]\n\n\n[TECHNICAL SKILLS]\n\n\n[PROFESSIONAL EXPERIENCE]\n`
  };
  
  currentProfileId = cleanLabel;
  localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
  PROFILE = profiles[currentProfileId].profile;
  saveToStorage();
  updateProfileSelectDropdown();
  document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreview();
  showToast("Created blank profile: " + cleanLabel);
  
  // Auto-expand drawer for the new profile
  const drawer = document.getElementById('profile-drawer');
  if (!drawer.classList.contains('active')) {
    toggleDetailsForm();
  }
}

function duplicateCurrentProfile() {
  const name = prompt("Enter a label/identifier for the duplicated profile (e.g. 'Software_Engineer_Copy'):");
  if (!name) return;
  const cleanLabel = name.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
  if (!cleanLabel) { showToast("Invalid profile label. Use letters, numbers, underscores, or hyphens."); return; }
  if (profiles[cleanLabel]) { showToast("A profile with that label already exists."); return; }
  
  // Save current textarea content to active profile before duplicating
  const textareaVal = document.getElementById('resume-text').value;
  profiles[currentProfileId].text = textareaVal;
  
  // Clone active profile's details and text
  profiles[cleanLabel] = JSON.parse(JSON.stringify(profiles[currentProfileId]));
  
  currentProfileId = cleanLabel;
  localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
  PROFILE = profiles[currentProfileId].profile;
  saveToStorage();
  updateProfileSelectDropdown();
  document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreview();
  showToast("Duplicated profile to: " + cleanLabel);
}

function renameCurrentProfile() {
  const newLabel = prompt("Enter a new label for the active profile:", currentProfileId);
  if (!newLabel) return;
  const cleanLabel = newLabel.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
  if (!cleanLabel) { showToast("Invalid profile label."); return; }
  if (profiles[cleanLabel] && cleanLabel !== currentProfileId) {
    showToast("A profile with that label already exists.");
    return;
  }
  
  if (cleanLabel !== currentProfileId) {
    const oldLabel = currentProfileId;
    profiles[cleanLabel] = profiles[currentProfileId];
    delete profiles[currentProfileId];
    
    currentProfileId = cleanLabel;
    PROFILE = profiles[currentProfileId].profile;
    localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
    saveToStorage();
    updateProfileSelectDropdown();
    showToast(`Renamed profile from "${oldLabel}" to "${cleanLabel}"`);
  }
}

function deleteCurrentProfile() {
  const keys = Object.keys(profiles);
  if (keys.length <= 1) {
    showToast("You must keep at least one profile.");
    return;
  }
  const targetId = currentProfileId;
  if (confirm(`Are you sure you want to delete the profile "${targetId}"?`)) {
    delete profiles[targetId];
    currentProfileId = Object.keys(profiles)[0];
    localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
    PROFILE = profiles[currentProfileId].profile;
    saveToStorage();
    updateProfileSelectDropdown();
    document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
    renderFormFields();
    detectSectionsAndCompanies();
    updatePreview();
    showToast(`Deleted profile "${targetId}"`);
  }
}

function toggleDetailsForm() {
  const drawer = document.getElementById('profile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const btn = document.getElementById('toggle-details-btn');
  
  if (!drawer.classList.contains('active')) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    btn.classList.add('active');
  } else {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    btn.classList.remove('active');
  }
}

function updateProfileField(field, value) {
  profiles[currentProfileId].profile[field] = value;
  saveToStorage();
  updatePreview();
}

function updateEduField(index, field, value) {
  if (!profiles[currentProfileId].profile.education[index]) return;
  profiles[currentProfileId].profile.education[index][field] = value;
  saveToStorage();
  updatePreview();
}

function updateCertField(index, value) {
  if (!profiles[currentProfileId].profile.certs) profiles[currentProfileId].profile.certs = [];
  profiles[currentProfileId].profile.certs[index] = value;
  saveToStorage();
  updatePreview();
}

// Ensure profiles save text changes when user edits textarea
function saveTextToActiveProfile() {
  if (profiles[currentProfileId]) {
    profiles[currentProfileId].text = document.getElementById('resume-text').value;
    saveToStorage();
  }
}

function addEducationRow() {
  if (!profiles[currentProfileId].profile.education) profiles[currentProfileId].profile.education = [];
  profiles[currentProfileId].profile.education.push({ degree: '', school: '', dates: '', location: '' });
  saveToStorage();
  renderFormFields();
  updatePreview();
}

function removeEducationRow(index) {
  profiles[currentProfileId].profile.education.splice(index, 1);
  saveToStorage();
  renderFormFields();
  updatePreview();
}

function addCertRow() {
  if (!profiles[currentProfileId].profile.certs) profiles[currentProfileId].profile.certs = [];
  profiles[currentProfileId].profile.certs.push('');
  saveToStorage();
  renderFormFields();
  updatePreview();
}

function removeCertRow(index) {
  profiles[currentProfileId].profile.certs.splice(index, 1);
  saveToStorage();
  renderFormFields();
  updatePreview();
}

function renderFormFields() {
  const p = profiles[currentProfileId].profile;
  document.getElementById('prof-name').value = p.name || '';
  document.getElementById('prof-subtitle').value = p.subtitle || '';
  document.getElementById('prof-email').value = p.email || '';
  document.getElementById('prof-phone').value = p.phone || '';
  document.getElementById('prof-location').value = p.location || '';
  document.getElementById('prof-linkedin').value = p.linkedin || '';
  
  // Render education
  const eduContainer = document.getElementById('education-fields-container');
  eduContainer.innerHTML = (p.education || []).map((e, index) => `
    <div class="edu-item-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
        <span style="font-size:10px; color:var(--app-ink-muted); font-weight:700;">EDUCATION #${index+1}</span>
        <button class="btn-remove" onclick="removeEducationRow(${index})">✕ Remove</button>
      </div>
      <div class="form-grid-mini">
        <input type="text" placeholder="Degree / Program" value="${escHtml(e.degree || '')}" oninput="updateEduField(${index}, 'degree', this.value)">
        <input type="text" placeholder="School / University" value="${escHtml(e.school || '')}" oninput="updateEduField(${index}, 'school', this.value)">
        <input type="text" placeholder="Dates (e.g. 06/2021 – 05/2023)" value="${escHtml(e.dates || '')}" oninput="updateEduField(${index}, 'dates', this.value)">
        <input type="text" placeholder="Location (e.g. Houston, TX)" value="${escHtml(e.location || '')}" oninput="updateEduField(${index}, 'location', this.value)">
      </div>
    </div>
  `).join('');

  // Render certs
  const certsContainer = document.getElementById('certs-fields-container');
  certsContainer.innerHTML = (p.certs || []).map((c, index) => `
    <div class="cert-item-row" style="display:flex; gap:8px; margin-bottom:6px;">
      <input type="text" placeholder="Certification Name" value="${escHtml(c || '')}" oninput="updateCertField(${index}, this.value)" class="cert-input" style="flex:1;">
      <button class="btn-remove-icon" onclick="removeCertRow(${index})">✕</button>
    </div>
  `).join('');
}

function triggerImport() {
  document.getElementById('import-file-input').click();
}

function importProfiles(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (typeof importedData !== 'object' || importedData === null) {
        throw new Error("Invalid file format. Must be a JSON object.");
      }
      
      const keys = Object.keys(importedData);
      if (keys.length === 0) {
        throw new Error("No profiles found in the backup file.");
      }
      
      let validCount = 0;
      keys.forEach(k => {
        const item = importedData[k];
        if (item && typeof item === 'object' && item.profile && typeof item.profile === 'object') {
          validCount++;
        }
      });
      
      if (validCount === 0) {
        throw new Error("No valid profiles found. Each profile must have a 'profile' object.");
      }
      
      if (confirm(`Found ${validCount} profiles in backup: ${keys.join(', ')}.\nDo you want to merge them into your current profiles? (Profiles with the same label will be overwritten)`)) {
        keys.forEach(k => {
          const item = importedData[k];
          if (item && typeof item === 'object' && item.profile && typeof item.profile === 'object') {
            profiles[k] = {
              profile: {
                name: item.profile.name || '',
                subtitle: item.profile.subtitle || '',
                email: item.profile.email || '',
                phone: item.profile.phone || '',
                location: item.profile.location || '',
                linkedin: item.profile.linkedin || '',
                summary: item.profile.summary || '',
                skills: item.profile.skills || '',
                education: Array.isArray(item.profile.education) ? item.profile.education.map(e => ({
                  degree: e.degree || '',
                  school: e.school || '',
                  dates: e.dates || '',
                  location: e.location || ''
                })) : [],
                certs: Array.isArray(item.profile.certs) ? item.profile.certs.map(c => String(c)) : []
              },
              text: item.text || ''
            };
          }
        });
        
        upgradeAllProfiles();
        
        currentProfileId = keys[0];
        localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
        PROFILE = profiles[currentProfileId].profile;
        
        saveToStorage();
        updateProfileSelectDropdown();
        document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
        renderFormFields();
        detectSectionsAndCompanies();
        updatePreview();
        
        showToast("Profiles successfully imported!");
      }
    } catch (err) {
      showToast("Error importing profiles: " + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function exportProfiles() {
  const textareaVal = document.getElementById('resume-text').value;
  profiles[currentProfileId].text = textareaVal;
  
  // Package only the current active profile to export
  const activeProfileData = {
    [currentProfileId]: profiles[currentProfileId]
  };
  
  const dataStr = JSON.stringify(activeProfileData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  saveAs(blob, `${currentProfileId}_backup.json`);
  showToast(`Exported "${currentProfileId}" backup successfully!`);
}

// ── SECTION PARSER ──
function parseContent(raw) {
  const summaryRx   = /\[?(?:SUMMARY|PROFESSIONAL SUMMARY)\]?([\s\S]*?)(?=\[|$)/i;
  const skillsRx    = /\[?(?:SKILLS|TECHNICAL SKILLS)\]?([\s\S]*?)(?=\[|$)/i;
  const experienceRx= /\[?(?:EXPERIENCE|PROFESSIONAL EXPERIENCE)\]?([\s\S]*?)(?=\[|$)/i;
  const get = (rx) => { const m = raw.match(rx); return m ? m[1].trim() : ''; };
  return { summary: get(summaryRx), skills: get(skillsRx), experience: get(experienceRx) };
}


// ── PREVIEW BUILDER ──

// ── SCALE PREVIEW TO FIT VIEWPORT ──
let lastPaneWidth = 0;
let lastMockupWidth = 0;
let lastMockupHeight = 0;
let isScaling = false;

function adjustPreviewScale() {
  if (isScaling) return;
  
  const pane = document.querySelector('.preview-pane');
  const mockup = document.getElementById('resume-mockup');
  if (!pane || !mockup) return;
  
  const paneWidth = pane.clientWidth - 32;
  const mockupWidth = mockup.offsetWidth;
  const mockupHeight = mockup.offsetHeight;
  
  // Return early if dimensions haven't changed significantly to prevent layout recursion and scrollbar oscillation loops
  if (Math.abs(paneWidth - lastPaneWidth) < 12 && 
      mockupWidth === lastMockupWidth && 
      mockupHeight === lastMockupHeight) {
    return;
  }
  
  isScaling = true;
  
  if (paneWidth <= 0 || mockupWidth <= 0) {
    isScaling = false;
    return;
  }
  
  lastPaneWidth = paneWidth;
  lastMockupWidth = mockupWidth;
  lastMockupHeight = mockupHeight;
  
  if (paneWidth < mockupWidth) {
    const scale = paneWidth / mockupWidth;
    const heightReduction = mockupHeight * (1 - scale);
    
    mockup.style.transform = `scale(${scale})`;
    mockup.style.transformOrigin = 'top center';
    mockup.style.marginBottom = `-${heightReduction}px`;
  } else {
    mockup.style.transform = 'none';
    mockup.style.transformOrigin = 'initial';
    mockup.style.marginBottom = '0';
  }
  
  // Release execution lock in the next animation frame
  requestAnimationFrame(() => {
    isScaling = false;
  });
}
window.addEventListener('resize', adjustPreviewScale);

// ── PREVIEW BUILDER ──
function updatePreview() {
  const raw = document.getElementById('resume-text').value.trim();
  const mockup = document.getElementById('resume-mockup');

  if (!raw && !PROFILE.name) {
    mockup.innerHTML = `<div class="empty-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center;"><svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--app-ink-muted); margin-bottom: 8px;"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0A2.25 2.25 0 0 1 13.5 4.75h-3a2.25 2.25 0 0 1-2.166-1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.346.102.637.318.806.622L18 7.5V19.5a2.25 2.25 0 0 1-2.25 2.25H8.25A2.25 2.25 0 0 1 6 19.5V7.5l1.112-2.012a1.125 1.125 0 0 1 .806-.622" /></svg><p>Paste your resume content above to see a live preview here</p></div>`;
    return;
  }

  const { summary, skills, experience } = parseContent(raw);
  
  // Create elements array dynamically
  const elements = [];

  // Helper to create HTML element from HTML string
  function createEl(htmlStr) {
    const div = document.createElement('div');
    div.innerHTML = htmlStr.trim();
    return div.firstElementChild || div;
  }

  // 1. Header (Name, Subtitle, Contact)
  const contactParts = [];
  if (PROFILE.location) contactParts.push(escHtml(PROFILE.location));
  if (PROFILE.phone) contactParts.push(escHtml(PROFILE.phone));
  if (PROFILE.email) contactParts.push(`<a href="mailto:${escHtml(PROFILE.email)}">${escHtml(PROFILE.email)}</a>`);
  if (PROFILE.linkedin) {
    let rawUrl = PROFILE.linkedin.trim();
    let hrefUrl = rawUrl;
    if (!/^https?:\/\//i.test(hrefUrl)) {
      hrefUrl = 'https://' + hrefUrl;
    }
    let display = rawUrl.replace(/^https?:\/\//i, '');
    display = display.replace(/^www\./i, '');
    display = display.replace(/-[a-zA-Z0-9]+(?=\/?$)/, '');
    display = display.replace(/\/+$/, '');
    contactParts.push(`<a href="${escHtml(hrefUrl)}" target="_blank">${escHtml(display)}</a>`);
  }
  const contactHtml = contactParts.join(' &nbsp;|&nbsp; ');

  elements.push(createEl(`
    <div style="text-align: center;">
      <div class="mock-name">${escHtml(PROFILE.name || '')}</div>
      <div class="mock-subtitle">${escHtml(PROFILE.subtitle || '')}</div>
      <div class="mock-contact">
        ${contactHtml}
      </div>
    </div>
  `));

  // 2. Summary
  if (summary) {
    elements.push(createEl(`<div class="mock-section-head">PROFESSIONAL SUMMARY:</div>`));
    elements.push(createEl(`<div class="mock-text">${escHtml(summary)}</div>`));
  }

  // 3. Technical Skills
  if (skills) {
    elements.push(createEl(`<div class="mock-section-head">TECHNICAL SKILLS:</div>`));
    skills.split('\n').filter(l => l.trim()).forEach(line => {
      const cleanLine = line.trim().replace(/^[-•*]\s*/, '');
      const idx = cleanLine.indexOf(':');
      if (idx > -1) {
        elements.push(createEl(`<div class="mock-text" style="text-align: left; margin-bottom: 4pt;"><strong>${escHtml(cleanLine.substring(0, idx+1))}</strong>${escHtml(cleanLine.substring(idx+1))}</div>`));
      } else {
        elements.push(createEl(`<div class="mock-text" style="text-align: left; margin-bottom: 4pt;">${escHtml(cleanLine)}</div>`));
      }
    });
  }

  // 4. Professional Experience
  if (experience) {
    elements.push(createEl(`<div class="mock-section-head">PROFESSIONAL EXPERIENCE:</div>`));
    experience.split('\n').filter(l => l.trim()).forEach(line => {
      const t = line.trim();
      if (/^[-•*]/.test(t)) {
        elements.push(createEl(`<div class="mock-bullet">${escHtml(t.replace(/^[-•*]\s*/, ''))}</div>`));
      } else if (t.includes('|')) {
        const parts = t.split('|').map(p => p.trim());
        if (parts.length >= 4) {
          elements.push(createEl(`
            <div class="mock-exp-header">
              <span>${escHtml(parts[2])}</span>
              <span>${escHtml(parts[3])}</span>
            </div>
          `));
          elements.push(createEl(`
            <div class="mock-exp-header" style="font-weight: normal; margin-top: 0; margin-bottom: 4pt;">
              <span style="font-weight: normal;">${escHtml(parts[0])}</span>
              <span style="font-weight: normal;">${escHtml(parts[1])}</span>
            </div>
          `));
        } else if (parts.length === 3) {
          elements.push(createEl(`
            <div class="mock-exp-header">
              <span>${escHtml(parts[1])}</span>
              <span>${escHtml(parts[2])}</span>
            </div>
          `));
          elements.push(createEl(`<div class="mock-exp-role">${escHtml(parts[0])}</div>`));
        } else {
          elements.push(createEl(`<div class="mock-exp-header"><span>${escHtml(t)}</span></div>`));
        }
      } else {
        elements.push(createEl(`<div class="mock-text" style="margin-top:4px">${escHtml(t)}</div>`));
      }
    });
  }

  // 5. Education
  elements.push(createEl(`<div class="mock-section-head">EDUCATION:</div>`));
  PROFILE.education.forEach(e => {
    elements.push(createEl(`
      <div class="mock-edu-row">
        <span>${escHtml(e.degree)}</span>
        <span>${escHtml(e.dates)}</span>
      </div>
    `));
    elements.push(createEl(`<div class="mock-edu-school">${escHtml(e.school)}${e.location ? ', ' + escHtml(e.location) : ''}</div>`));
  });

  // 6. Certifications
  if (PROFILE.certs && PROFILE.certs.length) {
    elements.push(createEl(`<div class="mock-section-head">CERTIFICATIONS:</div>`));
    PROFILE.certs.forEach(c => {
      elements.push(createEl(`<div class="mock-bullet">${escHtml(c)}</div>`));
    });
  }

  // Now, paginate the elements into pages dynamically!
  mockup.innerHTML = '';
  
  function createPageEl(num) {
    const page = document.createElement('div');
    page.className = 'preview-page';
    page.id = `page-${num}`;
    page.innerHTML = `
      <div class="mock-page-border"></div>
      <div class="page-content"></div>
    `;
    return page;
  }

  let pageNum = 1;
  let currentPage = createPageEl(pageNum);
  mockup.appendChild(currentPage);
  let pageContent = currentPage.querySelector('.page-content');

  elements.forEach(el => {
    pageContent.appendChild(el);
    // Page height is 11in = 1056px. available inner content height is ~970px.
    // Use children.length > 1 safeguard to prevent infinite page creation loops.
    if (pageContent.offsetHeight > 970 && pageContent.children.length > 1) {
      pageContent.removeChild(el);
      pageNum++;
      currentPage = createPageEl(pageNum);
      mockup.appendChild(currentPage);
      pageContent = currentPage.querySelector('.page-content');
      pageContent.appendChild(el);
    }
  });

  updateCombinedPromptPreview();
  setTimeout(adjustPreviewScale, 10);
  triggerScoreCalculation();
}



function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── PASTE FROM CLIPBOARD ──
async function pasteFromClipboard() {
  const btn = document.getElementById('paste-btn');
  try {
    let text = await navigator.clipboard.readText();
    if (!text || !text.trim()) {
      showToast('Clipboard is empty. Copy your resume text first.');
      return;
    }
    text = text.replace(/^(\d+\.)(?!\d)\s*/gm, '- ');
    document.getElementById('resume-text').value = text;
    detectSectionsAndCompanies();
    updatePreview();
    parseCompanies(text);

    const span = btn.querySelector('span');
    const originalText = span.textContent;
    span.textContent = '✓ Pasted!';
    btn.classList.add('pasted');
    setTimeout(() => {
      span.textContent = originalText;
      btn.classList.remove('pasted');
    }, 2000);
  } catch (err) {
    // Fallback: focus textarea so user can Ctrl+V and flash drop-area
    showToast('Clipboard access blocked. Please paste manually using Ctrl+V (or Cmd+V).');
    const textarea = document.getElementById('resume-text');
    const dropArea = document.querySelector('.drop-area');
    if (textarea) textarea.focus();
    if (dropArea) {
      dropArea.classList.add('flash-focus');
      setTimeout(() => dropArea.classList.remove('flash-focus'), 1600);
    }
  }
}

// ── COMPANY EXPERIENCE PARSER ──
function parseCompanies(raw) {
  const { experience } = parseContent(raw);
  if (!experience) {
    document.getElementById('company-section').classList.remove('visible');
    return;
  }

  // Find company header lines (lines with | separators like: Company | Location | Role | Dates)
  const lines = experience.split('\n').filter(l => l.trim());
  const companies = [];
  let current = null;

  lines.forEach(line => {
    const t = line.trim();
    if (t.includes('|') && !/^[-•*]/.test(t)) {
      // This is a company header line
      const parts = t.split('|').map(p => p.trim());
      const companyName = parts[0];
      current = { name: companyName, fullHeader: t, bullets: [] };
      companies.push(current);
    } else if (/^[-•*]/.test(t) && current) {
      current.bullets.push(t);
    }
  });

  const section = document.getElementById('company-section');
  const btnsContainer = document.getElementById('company-btns');

  if (companies.length === 0) {
    section.classList.remove('visible');
    return;
  }

  section.classList.add('visible');
  btnsContainer.innerHTML = companies.map((c, i) =>
    `<button class="company-copy-btn" id="company-btn-${i}" onclick="copyCompanyExp(${i})">
      <span>${escHtml(c.name)} Experience</span>
      <span class="copy-label">Click to copy</span>
    </button>`
  ).join('');

  // Store parsed companies globally for the copy function
  window._parsedCompanies = companies;
}

function copyCompanyExp(index) {
  const company = window._parsedCompanies[index];
  if (!company) return;

  const text = company.bullets.join('\n');
  navigator.clipboard.writeText(text);

  const btn = document.getElementById(`company-btn-${index}`);
  btn.classList.add('copied');
  btn.querySelector('.copy-label').textContent = '✓ Copied!';
  showToast(`Copied ${company.name} experience to clipboard`);
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.querySelector('.copy-label').textContent = 'Click to copy';
  }, 2000);
}

// -- DIRECT PDF DOWNLOAD VIA HTML2PDF --
document.getElementById('pdf-btn').onclick = async () => {
  const raw = document.getElementById('resume-text').value.trim();
  if (!raw) {
    showToast('Please enter some resume content before downloading.');
    return;
  }

  const btn = document.getElementById('pdf-btn');
  btn.disabled = true;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = 'Generating…';
  showToast('Generating PDF document…');

  const element = document.getElementById('resume-mockup');
  
  // Save original styles
  const originalTransform = element.style.transform;
  const originalMarginBottom = element.style.marginBottom;
  
  // Temporarily reset transform to full scale for capture
  element.style.transform = 'none';
  element.style.marginBottom = '0';
  
  // Temporarily strip page shadows/margins for clean PDF splits
  const pages = element.querySelectorAll('.preview-page');
  const originalPageStyles = [];
  pages.forEach(p => {
    originalPageStyles.push({
      boxShadow: p.style.boxShadow,
      margin: p.style.margin,
      border: p.style.border,
      borderRadius: p.style.borderRadius
    });
    p.style.boxShadow = 'none';
    p.style.margin = '0';
    p.style.border = 'none';
    p.style.borderRadius = '0';
  });

  const opt = {
    margin:       0,
    filename:     `${currentProfileId}_Resume.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2.5, useCORS: true, logging: false },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    // Trigger download directly from the styled preview element
    await html2pdf().set(opt).from(element).save();
    showToast('PDF Resume downloaded successfully!');
  } catch (err) {
    console.error(err);
    showToast('Error generating PDF: ' + err.message);
  } finally {
    // Restore original styles immediately
    element.style.transform = originalTransform;
    element.style.marginBottom = originalMarginBottom;
    pages.forEach((p, i) => {
      p.style.boxShadow = originalPageStyles[i].boxShadow;
      p.style.margin = originalPageStyles[i].margin;
      p.style.border = originalPageStyles[i].border;
      p.style.borderRadius = originalPageStyles[i].borderRadius;
    });
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
};

// Also parse companies when user types/pastes manually in textarea
function detectSectionsAndCompanies() {
  const raw = document.getElementById('resume-text').value;
  parseCompanies(raw);
}
// Override oninput to also parse companies and save text to active profile
document.getElementById('resume-text').oninput = function() {
  const original = this.value;
  const sanitized = original.replace(/^(\d+\.)(?!\d)\s*/gm, '- ');
  if (original !== sanitized) {
    const cursor = this.selectionStart;
    this.value = sanitized;
    if (cursor !== null) this.setSelectionRange(cursor, cursor);
  }
  saveTextToActiveProfile();
  detectSectionsAndCompanies();
  updatePreview();
};

// ── TOAST NOTIFICATION SYSTEM ──
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="color:#3b82f6; flex-shrink: 0; display: inline-block; vertical-align: middle; margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.5c1.153-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg> <span>${escHtml(message)}</span>`;
  
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 2500);
}


// ── GLOBAL OFFLINE PASTE CAPTURE ──
document.addEventListener('paste', (e) => {
  const pastedText = (e.clipboardData || window.clipboardData).getData('text');
  if (!pastedText) return;

  const textarea = document.getElementById('resume-text');
  if (!textarea) return;

  const activeEl = document.activeElement;
  if (activeEl !== textarea && activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA') {
    e.preventDefault();
    const sanitized = pastedText.replace(/^(\d+\.)(?!\d)\s*/gm, '- ');
    textarea.value = sanitized;
    detectSectionsAndCompanies();
    updatePreview();
    showToast('Pasted resume content successfully!');
  }
});

// ── DRAG AND DROP TEXT FILES ──
window.addEventListener('DOMContentLoaded', () => {
  const dropArea = document.querySelector('.drop-area');
  if (dropArea) {
    dropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'var(--app-accent)';
      dropArea.style.background = 'rgba(0, 112, 243, 0.02)';
    });
    
    dropArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'var(--app-border)';
      dropArea.style.background = '#000';
    });
    
    dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'var(--app-border)';
      dropArea.style.background = '#000';
      
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          document.getElementById('resume-text').value = evt.target.result;
          detectSectionsAndCompanies();
          updatePreview();
          showToast("Imported resume text file");
        };
        reader.readAsText(file);
      }
    });
  }
});

// ── DOCX DOWNLOAD ──


function saveAs(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function ensureLibs() { return Promise.resolve(); }

document.getElementById('dl-btn').onclick = async () => {
  const raw = document.getElementById('resume-text').value.trim();
  if (!raw) {
    showToast('Please enter some resume content before downloading.');
    return;
  }

  const { summary, skills, experience } = parseContent(raw);
  const P = PROFILE;

  const btn = document.getElementById('dl-btn');
  btn.disabled = true;
  btn.classList.add('loading');
  showToast('Generating DOCX document…');

  try {
    const { Document, Packer, Paragraph, TextRun, ExternalHyperlink,
            AlignmentType, BorderStyle, LevelFormat, TabStopType } = docx;

    // Headings format (uppercase text, bold, size 22 / 11pt, margin-left: 360 / 18pt, border bottom)
    function sectionHead(text) {
      return new Paragraph({
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000', space: 2 } },
        children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: 'Times New Roman', color: '000000' })]
      });
    }

    // Bullet items (size 22 / 11pt, regular, spacing before 30 after 30, indent left 240 hanging 240, custom tab stop at 240)
    function bullet(text) {
      return new Paragraph({
        spacing: { before: 30, after: 30 },
        indent: { left: 240, hanging: 240 },
        tabStops: [{ type: TabStopType.LEFT, position: 240 }],
        children: [
          new TextRun({ text: "•\t", font: 'Times New Roman', size: 22, color: '000000' }),
          new TextRun({ text, font: 'Times New Roman', size: 22, color: '000000' })
        ]
      });
    }

    // Skills logic (supports multiple dash types)
    function skillsDocx(raw) {
      if (!raw) return [];
      return raw.split('\n').filter(l => l.trim()).map(line => {
        const cleanLine = line.trim().replace(/^[-•*–—\u2013\u2014\u2022]\s*/, '');
        const idx = cleanLine.indexOf(':');
        if (idx > -1) {
          return new Paragraph({
            spacing: { before: 30, after: 30 },
            children: [
              new TextRun({ text: cleanLine.substring(0, idx+1), bold: true, font: 'Times New Roman', size: 22, color: '000000' }),
              new TextRun({ text: cleanLine.substring(idx+1), font: 'Times New Roman', size: 22, color: '000000' })
            ]
          });
        }
        return new Paragraph({
          spacing: { before: 30, after: 30 },
          children: [new TextRun({ text: cleanLine, font: 'Times New Roman', size: 22, color: '000000' })]
        });
      });
    }

    // Experience logic (supports multiple dash types, right-aligns dates/locations)
    function expDocx(raw) {
      if (!raw) return [];
      return raw.split('\n').filter(l => l.trim()).map(line => {
        const t = line.trim();
        if (/^[-•*–—\u2013\u2014\u2022]/.test(t)) return bullet(t.replace(/^[-•*–—\u2013\u2014\u2022]\s*/, ''));
        if (t.includes('|')) {
          const parts = t.split('|').map(p => p.trim());
          const rows = [];
          if (parts.length >= 4) {
            // Role with Dates (tabbed right margin at 10800 dxa)
            rows.push(new Paragraph({
              spacing: { before: 180, after: 40 },
              tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
              children: [
                new TextRun({ text: parts[2], bold: true, font: 'Times New Roman', size: 22, color: '000000' }),
                new TextRun({ text: '\t' }),
                new TextRun({ text: parts[3], bold: true, font: 'Times New Roman', size: 22, color: '000000' })
              ]
            }));
            // Company with Location (tabbed right margin at 10800 dxa)
            rows.push(new Paragraph({
              spacing: { before: 0, after: 60 },
              tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
              children: [
                new TextRun({ text: parts[0], font: 'Times New Roman', size: 22, color: '000000' }),
                new TextRun({ text: '\t' }),
                new TextRun({ text: parts[1], font: 'Times New Roman', size: 22, color: '000000' })
              ]
            }));
          } else if (parts.length === 3) {
            // Role with Dates (tabbed right margin at 10800 dxa)
            rows.push(new Paragraph({
              spacing: { before: 180, after: 40 },
              tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
              children: [
                new TextRun({ text: parts[1], bold: true, font: 'Times New Roman', size: 22, color: '000000' }),
                new TextRun({ text: '\t' }),
                new TextRun({ text: parts[2], bold: true, font: 'Times New Roman', size: 22, color: '000000' })
              ]
            }));
            // Company
            rows.push(new Paragraph({
              spacing: { before: 0, after: 60 },
              children: [new TextRun({ text: parts[0], font: 'Times New Roman', size: 22, color: '000000' })]
            }));
          }
          return rows;
        }
        // Plain text lines
        return new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [new TextRun({ text: t, font: 'Times New Roman', size: 22, color: '000000' })]
        });
      }).flat();
    }

    // Summary Text
    const summaryParagraphs = [];
    if (summary) {
      summaryParagraphs.push(sectionHead('Professional Summary'));
      summaryParagraphs.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: summary, font: 'Times New Roman', size: 22, color: '000000' })]
      }));
    }

    // Education Paragraphs (flex rows formatted as right tab stops at 10800 dxa)
    const eduParagraphs = [sectionHead('Education')];
    P.education.forEach(e => {
      eduParagraphs.push(new Paragraph({
        spacing: { before: 180, after: 40 },
        tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
        children: [
          new TextRun({ text: e.degree, bold: true, font: 'Times New Roman', size: 22, color: '000000' }),
          new TextRun({ text: '\t' }),
          new TextRun({ text: e.dates, bold: true, font: 'Times New Roman', size: 22, color: '000000' })
        ]
      }));
      eduParagraphs.push(new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: `${e.school}${e.location ? ', ' + e.location : ''}`, font: 'Times New Roman', size: 22, color: '000000' })]
      }));
    });

    // Certifications Paragraphs
    const certParagraphs = [];
    const activeCerts = (P.certs || []).map(c => c.trim()).filter(Boolean);
    if (activeCerts.length) {
      certParagraphs.push(sectionHead('Certifications'));
      activeCerts.forEach(c => {
        certParagraphs.push(bullet(c));
      });
    }

    // Contact children
    const contactChildren = [];
    const textSeparator = () => new TextRun({ text: '  |  ', font: 'Times New Roman', size: 22, color: '000000' });
    
    // Add location and phone
    const contactParts = [];
    if (P.location) contactParts.push(P.location);
    if (P.phone) contactParts.push(P.phone);
    if (contactParts.length > 0) {
      contactChildren.push(new TextRun({ text: contactParts.join('  |  '), font: 'Times New Roman', size: 22, color: '000000' }));
    }
    
    // Add email
    if (P.email) {
      if (contactChildren.length > 0) contactChildren.push(textSeparator());
      contactChildren.push(new ExternalHyperlink({
        children: [
          new TextRun({ text: P.email, font: 'Times New Roman', size: 22, color: '0000ff', underline: true })
        ],
        link: `mailto:${P.email}`
      }));
    }
    
    // Add linkedin
    if (P.linkedin) {
      if (contactChildren.length > 0) contactChildren.push(textSeparator());
      let rawLinkedin = P.linkedin.trim();
      let hrefLinkedin = rawLinkedin;
      if (!/^https?:\/\//i.test(hrefLinkedin)) {
        hrefLinkedin = 'https://' + hrefLinkedin;
      }
      let displayLinkedin = rawLinkedin.replace(/^https?:\/\//i, '');
      displayLinkedin = displayLinkedin.replace(/^www\./i, '');
      displayLinkedin = displayLinkedin.replace(/-[a-zA-Z0-9]+(?=\/?$)/, '');
      displayLinkedin = displayLinkedin.replace(/\/+$/, '');
      
      contactChildren.push(new ExternalHyperlink({
        children: [
          new TextRun({ text: displayLinkedin, font: 'Times New Roman', size: 22, color: '0000ff', underline: true })
        ],
        link: hrefLinkedin
      }));
    }
    
    const contactParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: contactChildren
    });

    const doc = new Document({
      numbering: { config:[{ reference:'bullets', levels:[{ level:0, format:LevelFormat.BULLET, text:'•', alignment:AlignmentType.LEFT, style:{ paragraph:{ indent: { left: 360, hanging: 360 } } } }] }] },
      styles: { default: { document: { run:{ font:'Times New Roman', size:22, color:'000000' } } } },
      sections:[{
        properties:{
          page:{
            size:{width:12240,height:15840},
            margin:{top:720,right:720,bottom:720,left:720},
            borders: {
              pageBorders: {
                display: 'allPages',
                offsetFrom: 'page'
              },
              pageBorderTop: { style: 'single', size: 4, space: 24, color: '000000' },
              pageBorderLeft: { style: 'single', size: 4, space: 24, color: '000000' },
              pageBorderBottom: { style: 'single', size: 4, space: 24, color: '000000' },
              pageBorderRight: { style: 'single', size: 4, space: 24, color: '000000' }
            }
          }
        },
        children:[
          new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:80}, children:[new TextRun({text:P.name, bold:true, font:'Times New Roman', size:28, color:'000000'})] }),
          new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:120}, children:[new TextRun({text:P.subtitle, bold:true, font:'Times New Roman', size:22, color:'000000'})] }),
          contactParagraph,
          ...summaryParagraphs,
          sectionHead('Technical Skills'),
          ...skillsDocx(skills),
          sectionHead('Professional Experience'),
          ...expDocx(experience),
          ...eduParagraphs,
          ...certParagraphs
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${currentProfileId}_Resume.docx`);
    showToast('DOCX Resume downloaded successfully!');

  } catch(err) {
    console.error(err);
    showToast('Error generating DOCX: ' + err.message);
  }

  btn.disabled = false;
  btn.classList.remove('loading');
};

// Mobile navigation and view switching logic
function setMobileView(view) {
  const body = document.body;
  const navEdit = document.getElementById('mobile-nav-edit');
  const navPreview = document.getElementById('mobile-nav-preview');
  
  if (view === 'preview') {
    body.classList.add('show-preview');
    if (navEdit) navEdit.classList.remove('active');
    if (navPreview) navPreview.classList.add('active');
    // Force preview rendering and pagination when visible
    if (typeof updatePreview === 'function') {
      updatePreview();
    }
    // Adjust scale for mobile preview
    if (typeof adjustPreviewScale === 'function') {
      setTimeout(adjustPreviewScale, 50);
    }
  } else {
    body.classList.remove('show-preview');
    if (navEdit) navEdit.classList.add('active');
    if (navPreview) navPreview.classList.remove('active');
  }
}

function toggleMobileMenu(show) {
  const overlay = document.getElementById('mobile-menu-overlay');
  const drawer = document.getElementById('mobile-menu-drawer');
  if (!overlay || !drawer) return;
  if (show) {
    overlay.classList.add('active');
    drawer.classList.add('active');
  } else {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
  }
}

function triggerMobilePDF() {
  toggleMobileMenu(false);
  const pdfBtn = document.getElementById('pdf-btn');
  if (pdfBtn) pdfBtn.click();
}

function triggerMobileDOCX() {
  toggleMobileMenu(false);
  const dlBtn = document.getElementById('dl-btn');
  if (dlBtn) dlBtn.click();
}

function triggerMobileImport() {
  toggleMobileMenu(false);
  triggerImport();
}

function triggerMobileExport() {
  toggleMobileMenu(false);
  exportProfiles();
}

// ── AI TAILORING ASSISTANT LOGIC ──
let currentPromptTemplateText = "";

function toggleAIAssistant() {
  const container = document.querySelector('.ai-assistant-container');
  const btn = document.getElementById('ai-assistant-toggle');
  if (container) {
    container.classList.toggle('expanded');
    const isExpanded = container.classList.contains('expanded');
    if (btn) {
      btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }
    if (isExpanded) {
      const select = document.getElementById('ai-role-select');
      if (select && select.value) {
        loadSelectedPrompt();
      }
    }
  }
}

async function loadSelectedPrompt() {
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

function updateCombinedPromptPreview() {
  const preview = document.getElementById('ai-prompt-preview');
  if (!preview) return;

  if (!currentPromptTemplateText) {
    preview.value = "Select a role above to generate the AI prompt…";
    return;
  }

  preview.value = generateCombinedPrompt();
}

function generateCombinedPrompt() {
  const p = PROFILE || {};
  const currentResumeText = document.getElementById('resume-text').value.trim();

  let metadata = `
---

### BASE RESUME TO REWRITE:

**CANDIDATE INFORMATION:**
Name: ${p.name || ''}
Professional Title: ${p.subtitle || ''}
Email: ${p.email || ''}
Phone: ${p.phone || ''}
Location: ${p.location || ''}
LinkedIn: ${p.linkedin || ''}

**EDUCATION:**
`;

  if (p.education && p.education.length > 0) {
    p.education.forEach(e => {
      metadata += `- ${e.degree || ''} | ${e.school || ''} | ${e.dates || ''} | ${e.location || ''}\n`;
    });
  } else {
    metadata += `(None listed)\n`;
  }

  metadata += `\n**CERTIFICATIONS:**\n`;
  if (p.certs && p.certs.length > 0) {
    p.certs.forEach(c => {
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

async function copyAIPrompt() {
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

function toggleJDPane() {
  const pane = document.getElementById('jd-content');
  const btn = document.getElementById('jd-toggle-btn');
  if (pane && btn) {
    const isExpanded = pane.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  }
}
let scoreDebounceTimeout = null;
function triggerScoreCalculation() {
  const container = document.querySelector('.scoring-container');
  if (!container) return;
  
  if (scoreDebounceTimeout) {
    clearTimeout(scoreDebounceTimeout);
  }
  
  scoreDebounceTimeout = setTimeout(() => {
    calculateResumeScore();
  }, 150);
}

function calculateResumeScore() {
  const resumeText = document.getElementById('resume-text').value;
  const jdText = document.getElementById('jd-text') ? document.getElementById('jd-text').value.trim() : "";
  const p = PROFILE || {};

  const { summary, skills, experience } = parseContent(resumeText);
  const suggestions = [];

  // ==========================================
  // DIMENSION 1: ATS SCORE (Max 100)
  // ==========================================
  let kwRelevanceScore = 0;
  let jdKeywords = [];
  let matchedKeywords = [];
  let missingKeywords = [];

  let criticalList = [];
  let importantList = [];
  let preferredList = [];

  let criticalMatchedList = [];
  let importantMatchedList = [];
  let preferredMatchedList = [];

  let criticalMissingList = [];
  let importantMissingList = [];
  let preferredMissingList = [];

  if (jdText) {
    const STOP_WORDS = new Set([
      'the', 'and', 'for', 'with', 'you', 'our', 'are', 'this', 'that', 'will', 'work', 'team', 'from', 'your', 'have', 'their', 'they', 'them', 'who', 'what', 'its', 'about', 'been', 'were', 'was', 'has', 'had', 'does', 'did', 'but', 'not', 'can', 'should', 'would', 'could', 'than', 'then', 'into', 'onto', 'upon', 'also', 'other', 'some', 'such', 'only', 'very', 'more', 'most', 'any', 'each', 'both', 'all', 'one', 'two', 'new', 'old', 'good', 'best', 'well', 'etc', 'under', 'role', 'highly', 'required', 'skills', 'experience', 'ability', 'duties', 'responsibilities', 'project', 'support', 'management', 'technical', 'development',
      'job', 'may', 'sets', 'section', 'title', 'general', 'overview', 'functional', 'area', 'description', 'position', 'candidate', 'details', 'knowledge', 'maintenance', 'including', 'using', 'working', 'ability', 'successful', 'proven', 'track', 'record', 'strong', 'excellent', 'written', 'verbal', 'communication', 'interpersonal', 'skills', 'years', 'degree', 'preferred', 'required', 'ideal', 'plus', 'desirable', 'nice', 'have', 'must', 'should', 'will', 'would', 'could', 'join', 'company', 'client', 'customer', 'business', 'environment', 'organization', 'teamwork', 'collaborate', 'cooperate',
      'remote', 'apply', 'locations', 'posted', 'ago', 'requisition', 'type', 'time', 'full', 'part', 'days', 'months', 'weeks', 'to', 'on', 'in', 'of', 'is', 'at', 'as', 'or', 'be', 'by', 'an', 'it', 'if', 'so', 'no', 'do', 'up', 'us', 'we', 'go', 'am', 'other', 'others', 'another', 'like', 'than', 'then', 'there', 'their', 'them', 'they', 'he', 'she', 'his', 'her', 'him', 'its', 'about', 'above', 'below', 'under', 'over', 'between', 'through', 'during', 'before', 'after', 'against', 'with', 'without', 'within', 'around',
      'engineer', 'engineering', 'engineers', 'systems', 'system', 'projects', 'project', 'peachtree', 'corners', 'georgia', 'usa', 'united', 'states', 'america', 'fortna', 'corporate', 'office', 'travel', 'traveling', 'workplace', 'movement', 'collective', 'redefine', 'success', 'challenges', 'opportunities', 'opportunity', 'culture', 'diversity', 'individual', 'contribute', 'passion', 'approach', 'fostering', 'commitment', 'collaboration', 'collaborating', 'equal', 'opportunity', 'employer', 'race', 'color', 'religion', 'creed', 'sex', 'gender', 'national', 'origin', 'age', 'disability', 'veteran', 'marital', 'status', 'citizenship', 'pregnancy', 'accommodation', 'accommodations', 'physical', 'demands', 'lift', 'pounds', 'stand', 'walk', 'sit', 'climb', 'bend', 'stoop', 'kneel', 'crouch', 'crawl', 'noise',
      'partners', 'partnership', 'partner', 'world', 'worlds', 'leading', 'lead', 'leader', 'brands', 'brand', 'transform', 'transformation', 'operations', 'operation', 'digital', 'disruption', 'growth', 'objectives', 'objective', 'solutions', 'solution', 'powered', 'intelligent', 'fast', 'accurate', 'fulfillment', 'delivery', 'deliveries', 'people', 'person', 'innovative', 'innovation', 'algorithms', 'algorithm', 'optimal', 'optimize', 'optimizing', 'value', 'every', 'customer', 'customers', 'client', 'clients', 'comprehensive', 'services', 'service', 'products', 'product', 'strategy', 'strategies', 'center', 'centers', 'operational', 'automated', 'equipment', 'suite', 'lifecycle', 'transforming', 'hourly', 'pay', 'usd', 'benefits', 'affirmative', 'action', 'qualified', 'applicants', 'receive', 'consideration', 'protected', 'characteristic', 'federal', 'state', 'local', 'law', 'reasonable', 'qualified', 'individuals', 'disabilities', 'policy', 'affiliated', 'companies', 'persons', 'regardless', 'sexual', 'orientation', 'identity', 'expression', 'genetic', 'regard', 'public', 'assistance', 'authorized', 'representative', 'successfully', 'perform', 'essential', 'functions', 'navigate', 'safely', 'over', 'around', 'automation', 'stamina', 'prolonged', 'standing', 'cramped', 'quarters', 'exposure', 'dangerous', 'tools', 'materials', 'probable', 'moving', 'mechanical', 'parts', 'level', 'vary', 'quiet', 'moderate', 'excessive', 'salary', 'representing', 'low', 'high', 'end', 'actual', 'offered', 'based', 'various', 'factors', 'performance', 'employees', 'duties', 'requested', 'supervisor', 'posting', 'information', 'requirements', 'indicate', 'minimum', 'deemed', 'necessary', 'proficiently', 'provide', 'individuals', 'distribution',
      'and/or', 'additionally', 'individually', 'demonstrates', 'demonstrate', 'expected', 'unexpected', 'comparable', 'equivalent', 'expect', 'expects', 'expectedly', 'expecting', 'requirements', 'requirement', 'required'
    ]);
    const SHORT_TECH = new Set(['c#', 'c', 'go', 'r', 'ip', 'io', 'it', 'hr', 's3', 'ft']);

    const lines = jdText.split('\n').filter(line => {
      const l = line.toLowerCase();
      // Skip section headers ending in a colon or consisting of header names
      if (/^\s*[a-z0-9_/\-\s]+:\s*$/i.test(line.trim())) return false;
      if (/^\s*(essential functions|qualifications|skills\/abilities|work environment|travel|physical demands|salary|base salary)\s*$/i.test(line.trim())) return false;
      // Skip metadata lines
      if (/^\s*(locations|time type|posted|requisition id|apply)\b/i.test(l)) return false;
      if (/^\s*[a-z0-9\-]+\s*$/i.test(line.trim()) && !SHORT_TECH.has(l)) {
        // Skip single-word lines like "Apply", "R9119"
        return false;
      }
      // Skip EEO boilerplate
      if (/equal employment opportunity|race,\s*color|national\s*origin|veteran\s*status|gender\s*identity|protected\s*characteristic/i.test(l)) return false;
      // Skip physical demands boilerplate
      if (/physical demands|lift\s*\d+\s*(pounds|lbs)|climb\s*ladders/i.test(l)) return false;
      // Skip salary boilerplate
      if (/base salary range|salary range/i.test(l)) return false;
      return true;
    });
    const kwMap = {};

    lines.forEach(line => {
      const lineLower = line.toLowerCase();
      let category = 'important';
      if (/must|require|essential|minimum|qualification|need|should have/i.test(lineLower)) {
        category = 'critical';
      } else if (/preferred|plus|desirable|nice|ideal|bonus|advantage|opportunity/i.test(lineLower)) {
        category = 'preferred';
      }

      const words = line.match(/[a-zA-Z0-9+#.\-/]+/g) || [];
      words.forEach(word => {
        const clean = word.replace(/[.,;()]/g, '').trim();
        const lower = clean.toLowerCase();
        
        const isValidLen = lower.length >= 3 || SHORT_TECH.has(lower);
        const hasLetters = /[a-zA-Z]/.test(clean);
        
        if (isValidLen && hasLetters && !STOP_WORDS.has(lower)) {
          if (kwMap[lower]) {
            const currentCat = kwMap[lower].category;
            if (category === 'critical' || (category === 'important' && currentCat === 'preferred')) {
              kwMap[lower].category = category;
            }
          } else {
            kwMap[lower] = { raw: clean, category: category };
          }
        }
      });
    });

    const criticalCandidates = [];
    const importantCandidates = [];
    const preferredCandidates = [];

    Object.keys(kwMap).forEach(key => {
      const item = kwMap[key];
      if (item.category === 'critical') criticalCandidates.push(item);
      else if (item.category === 'important') importantCandidates.push(item);
      else preferredCandidates.push(item);
    });

    function rankCandidates(candidates) {
      return candidates.sort((a, b) => {
        const isAcronymOrSymbol = (word) => {
          return /^[A-Z0-9+#.\-/]+$/.test(word) || /[+#\/]/.test(word);
        };
        const isProperNoun = (word) => {
          return /^[A-Z][a-z]/.test(word);
        };

        const scoreA = isAcronymOrSymbol(a.raw) ? 3 : (isProperNoun(a.raw) ? 2 : 1);
        const scoreB = isAcronymOrSymbol(b.raw) ? 3 : (isProperNoun(b.raw) ? 2 : 1);

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return b.raw.length - a.raw.length;
      });
    }

    criticalList = rankCandidates(criticalCandidates).slice(0, 8);
    importantList = rankCandidates(importantCandidates).slice(0, 8);
    preferredList = rankCandidates(preferredCandidates).slice(0, 5);

    jdKeywords = [...criticalList, ...importantList, ...preferredList];

    if (jdKeywords.length > 0) {
      const resumeLower = resumeText.toLowerCase();
      
      criticalList.forEach(kw => {
        const cleanKw = kw.raw.toLowerCase();
        const startBoundary = /^\w/.test(cleanKw) ? '\\b' : '';
        const endBoundary = /\w$/.test(cleanKw) ? '\\b' : '';
        const regex = new RegExp(startBoundary + cleanKw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + endBoundary, 'i');
        if (regex.test(resumeLower)) {
          criticalMatchedList.push(kw.raw);
        } else {
          criticalMissingList.push(kw.raw);
        }
      });

      importantList.forEach(kw => {
        const cleanKw = kw.raw.toLowerCase();
        const startBoundary = /^\w/.test(cleanKw) ? '\\b' : '';
        const endBoundary = /\w$/.test(cleanKw) ? '\\b' : '';
        const regex = new RegExp(startBoundary + cleanKw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + endBoundary, 'i');
        if (regex.test(resumeLower)) {
          importantMatchedList.push(kw.raw);
        } else {
          importantMissingList.push(kw.raw);
        }
      });

      preferredList.forEach(kw => {
        const cleanKw = kw.raw.toLowerCase();
        const startBoundary = /^\w/.test(cleanKw) ? '\\b' : '';
        const endBoundary = /\w$/.test(cleanKw) ? '\\b' : '';
        const regex = new RegExp(startBoundary + cleanKw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + endBoundary, 'i');
        if (regex.test(resumeLower)) {
          preferredMatchedList.push(kw.raw);
        } else {
          preferredMissingList.push(kw.raw);
        }
      });

      matchedKeywords = [...criticalMatchedList, ...importantMatchedList, ...preferredMatchedList];
      missingKeywords = [...criticalMissingList, ...importantMissingList, ...preferredMissingList];

      let totalActiveWeight = 0;
      if (criticalList.length > 0) totalActiveWeight += 0.60;
      if (importantList.length > 0) totalActiveWeight += 0.30;
      if (preferredList.length > 0) totalActiveWeight += 0.10;

      if (totalActiveWeight > 0) {
        let scoreSum = 0;
        if (criticalList.length > 0) {
          scoreSum += (criticalMatchedList.length / criticalList.length) * (0.60 / totalActiveWeight);
        }
        if (importantList.length > 0) {
          scoreSum += (importantMatchedList.length / importantList.length) * (0.30 / totalActiveWeight);
        }
        if (preferredList.length > 0) {
          scoreSum += (preferredMatchedList.length / preferredList.length) * (0.10 / totalActiveWeight);
        }
        kwRelevanceScore = Math.round(scoreSum * 60);

        // Missing critical keywords penalty
        const missingCriticalPenalty = Math.min(20, criticalMissingList.length * 5);
        kwRelevanceScore = Math.max(0, kwRelevanceScore - missingCriticalPenalty);
      }
    }
    
    if (criticalMissingList.length > 0) {
      suggestions.push({ dim: 'ats', status: 'fail', text: `ATS: Missing ${criticalMissingList.length} critical keyword(s) required by the Job Description.` });
    } else if (jdKeywords.length > 0) {
      suggestions.push({ dim: 'ats', status: 'pass', text: "ATS: Excellent! All critical Job Description keywords are covered in your resume." });
    }
  } else {
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Paste a Job Description in the accordion below to calculate Keyword Relevance." });
  }

  // 2. Section Structure (10 points)
  let structureScore = 0;
  const hasSummary = /\[?(?:SUMMARY|PROFESSIONAL SUMMARY)\]?/i.test(resumeText);
  const hasSkills = /\[?(?:SKILLS|TECHNICAL SKILLS)\]?/i.test(resumeText);
  const hasExperience = /\[?(?:EXPERIENCE|PROFESSIONAL EXPERIENCE)\]?/i.test(resumeText);
  const hasEducation = /education/i.test(resumeText) || (p.education && p.education.length > 0);
  
  if (hasSummary) structureScore += 2.5;
  if (hasSkills) structureScore += 2.5;
  if (hasExperience) structureScore += 2.5;
  if (hasEducation) structureScore += 2.5;

  const hasCerts = /certifications|certs/i.test(resumeText) || (p.certs && p.certs.length > 0);
  const hasProjects = /projects/i.test(resumeText);
  const hasPublications = /publications/i.test(resumeText);
  
  if (hasCerts || hasProjects || hasPublications) {
    structureScore = Math.min(10, structureScore + 1.25);
  }
  structureScore = Math.round(structureScore);

  if (structureScore < 10) {
    const missing = [];
    if (!hasSummary) missing.push('[PROFESSIONAL SUMMARY]');
    if (!hasSkills) missing.push('[TECHNICAL SKILLS]');
    if (!hasExperience) missing.push('[PROFESSIONAL EXPERIENCE]');
    if (!hasEducation) missing.push('Education');
    suggestions.push({ dim: 'ats', status: 'fail', text: `ATS: Missing standard sections: ${missing.join(', ')}.` });
  } else {
    suggestions.push({ dim: 'ats', status: 'pass', text: "ATS: Standard resume sections are present and fully structured." });
  }

  // 3. Date Consistency (5 points)
  let dateScore = 0;
  const patternA = /\b(0[1-9]|1[0-2])\/\d{4}\b/g;
  const patternB = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/gi;
  const patternC = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi;

  const matchesA = resumeText.match(patternA) || [];
  const matchesB = resumeText.match(patternB) || [];
  const matchesC = resumeText.match(patternC) || [];

  let formatsFound = 0;
  if (matchesA.length > 0) formatsFound++;
  if (matchesB.length > 0) formatsFound++;
  if (matchesC.length > 0) formatsFound++;

  const totalDates = matchesA.length + matchesB.length + matchesC.length;

  if (totalDates === 0) {
    dateScore = 0;
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: No work experience dates detected. Add date ranges to establish career duration." });
  } else if (formatsFound === 1) {
    dateScore = 5;
    suggestions.push({ dim: 'ats', status: 'pass', text: "ATS: Date formats are consistent throughout the resume." });
  } else {
    dateScore = 2;
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Mixed date formats detected. Standardize date ranges to a single format." });
  }

  // 4. ATS Formatting (10 points)
  let formatScore = 10;
  const hasPipe = /\|/.test(experience || "");
  const hasTabs = /\t/.test(resumeText);
  const hasHtml = /<[^>]+>/.test(resumeText);

  if (hasPipe) {
    formatScore -= 3;
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Detected column dividers ('|') inside bullet lists. Keep lists simple." });
  }
  if (hasTabs) {
    formatScore -= 3;
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Avoid using tab indentation inside the textarea." });
  }
  if (hasHtml) {
    formatScore -= 4;
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Remove HTML or script markup tags from the resume text." });
  }
  formatScore = Math.max(0, formatScore);
  
  if (formatScore === 10) {
    suggestions.push({ dim: 'ats', status: 'pass', text: "ATS: Resume formatting is clean, single-column friendly, and fully compliant." });
  }

  // 5. Experience Alignment (10 points)
  let reqYoe = 0;
  if (jdText) {
    const yoeMatch = jdText.match(/\b(\d+)\+?\s*(?:years?|yoe)\b/i);
    if (yoeMatch) {
      reqYoe = parseInt(yoeMatch[1]);
    }
  }

  let actualYoe = 0;
  const summaryYoeMatch = summary ? summary.match(/\b(\d+)\+?\s*(?:years?|yoe)\b/i) : null;
  if (summaryYoeMatch) {
    actualYoe = parseInt(summaryYoeMatch[1]);
  } else {
    const rolesCount = (experience || "").split(/(?=[^|\n]+\|[^\n]+\|[^\n]+\|[^\n]+)/).length;
    actualYoe = Math.max(2, rolesCount * 2);
  }

  let expAlignScore = 10;
  if (jdText && reqYoe > 0) {
    if (actualYoe >= reqYoe) {
      expAlignScore = 10;
      suggestions.push({ dim: 'ats', status: 'pass', text: `ATS: Experience duration (${actualYoe} years) meets the JD target (${reqYoe} years).` });
    } else {
      expAlignScore = Math.round((actualYoe / reqYoe) * 10);
      suggestions.push({ dim: 'ats', status: 'fail', text: `ATS: Experience alignment. JD targets ${reqYoe} years, but resume shows ${actualYoe} years.` });
    }
  } else {
    expAlignScore = 10;
  }

  // 6. Education Alignment (5 points)
  let eduAlignScore = 5;
  if (jdText) {
    const degreeKeywords = /(bachelor|master|phd|doctorate|bs|ms|mba|b\.s\.|m\.s\.)/i;
    const jdDegreeMatch = jdText.match(degreeKeywords);
    if (jdDegreeMatch) {
      const reqDegree = jdDegreeMatch[1].toLowerCase();
      const resumeTextLower = resumeText.toLowerCase();
      if (!resumeTextLower.includes(reqDegree)) {
        eduAlignScore = 2;
        suggestions.push({ dim: 'ats', status: 'fail', text: `ATS: Required degree level (${jdDegreeMatch[1]}) not detected in resume text.` });
      } else {
        suggestions.push({ dim: 'ats', status: 'pass', text: `ATS: Target degree level (${jdDegreeMatch[1]}) is represented in the resume.` });
      }
    } else {
      suggestions.push({ dim: 'ats', status: 'pass', text: "ATS: No specific educational degree constraints found in the JD." });
    }
  } else {
    eduAlignScore = 5;
  }

  // ==========================================
  // DIMENSION 2: RECRUITER APPEAL (Max 100)
  // ==========================================
  let recSummaryScore = 0;
  if (summary) {
    const hasRoleTitle = /(engineer|developer|designer|analyst|manager|technician|specialist|lead|programmer|consultant|officer|coordinator|accountant|auditor|director|agent|architect)/i.test(summary);
    const hasYoe = /\b\d+\+?\s*(?:years?|yoe)\b/i.test(summary);
    const hasExpertise = summary.split(/\s+/).length > 15;
    const hasValueStatement = /(improve|reduce|increase|optimize|streamline|revenue|save|growth|enhance|deliver|drive)/i.test(summary.toLowerCase());

    if (hasRoleTitle) recSummaryScore += 5;
    else suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Professional summary lacks target role designation." });

    if (hasYoe) recSummaryScore += 5;
    else suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: State years of experience inside your summary statement." });

    if (hasExpertise) recSummaryScore += 5;
    else suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Detail core expertise sectors inside the summary." });

    if (hasValueStatement) recSummaryScore += 5;
    else suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Add a clear business value statement showing productivity / performance gains." });

    if (recSummaryScore === 20) {
      suggestions.push({ dim: 'recruiter', status: 'pass', text: "Recruiter: Professional Summary is high-impact and well-focused." });
    }
  } else {
    suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Write a professional summary statement." });
  }

  // 2. Experience Quality (35 points)
  let recExpScore = 0;
  if (experience) {
    const bullets = experience.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'));
    if (bullets.length > 0) {
      let bulletScores = [];
      const actionVerbs = /\b(designed|engineered|programmed|automated|commissioned|optimized|led|developed|reduced|increased|implemented|spearheaded|configured|authored|analyzed|managed|coordinated|established|secured|saved|drew|wrote)\b/i;
      const outcomeWords = /\b(resulted in|leading to|improving|reducing|increasing|saving|optimized|percent|%|hours|costs|\$)\b/i;

      bullets.forEach(b => {
        let bScore = 0;
        if (actionVerbs.test(b)) bScore += 10;
        if (b.split(/\s+/).length >= 8) bScore += 15;
        if (outcomeWords.test(b)) bScore += 10;
        bulletScores.push(bScore);
      });

      const avgBulletScore = bulletScores.reduce((sum, s) => sum + s, 0) / bullets.length;
      recExpScore = Math.round(avgBulletScore);
      
      const lowQualityCount = bulletScores.filter(s => s < 25).length;
      if (lowQualityCount > 0) {
        suggestions.push({ dim: 'recruiter', status: 'fail', text: `Recruiter: Found ${lowQualityCount} weak bullet point(s) lacking context or outcome statements.` });
      } else {
        suggestions.push({ dim: 'recruiter', status: 'pass', text: "Recruiter: Bullet points utilize strong verbs and explain task context." });
      }
    } else {
      suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: List detailed professional experience items using bullets." });
    }
  }

  // 3. Quantification (15 points)
  let recQuantScore = 0;
  const metricsCount = (resumeText.match(/\b\d+%/g) || []).length + 
                       (resumeText.match(/\$\b\d+/g) || []).length + 
                       (resumeText.match(/\b(reduced|increased|saved|improved)\s+by\s+\d+/gi) || []).length;
  
  if (metricsCount >= 5) recQuantScore = 15;
  else if (metricsCount >= 3) recQuantScore = 10;
  else if (metricsCount >= 1) recQuantScore = 5;
  else recQuantScore = 0;

  if (recQuantScore >= 10) {
    suggestions.push({ dim: 'recruiter', status: 'pass', text: "Recruiter: Resume details metrics showing measurable results." });
  } else {
    suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Quantify achievements with metrics (e.g. costs saved, revenue increased, percentages)." });
  }

  // 4. Career Progression (15 points)
  let recProgScore = 5;
  if (experience) {
    const roles = experience.split(/(?=[^|\n]+\|[^\n]+\|[^\n]+\|[^\n]+)/);
    if (roles.length >= 3) recProgScore = 15;
    else if (roles.length === 2) recProgScore = 10;
    
    const hasPromoted = /promoted|advancement|senior|lead|head/i.test(experience);
    if (hasPromoted && recProgScore < 15) {
      recProgScore += 2;
    }
  }
  if (recProgScore >= 10) {
    suggestions.push({ dim: 'recruiter', status: 'pass', text: "Recruiter: Work history reflects solid career progression." });
  }

  // 5. Readability (15 points)
  let recReadScore = 15;
  if (experience) {
    const bullets = experience.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'));
    if (bullets.length > 0) {
      const avgWordCount = bullets.reduce((sum, b) => sum + b.split(/\s+/).length, 0) / bullets.length;
      if (avgWordCount > 25) {
        recReadScore -= 5;
        suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Experience bullet points are too long. Keep sentences punchy." });
      } else if (avgWordCount < 5) {
        recReadScore -= 5;
        suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Bullet points are too brief. Add context to your tasks." });
      } else {
        suggestions.push({ dim: 'recruiter', status: 'pass', text: "Recruiter: Readability is excellent. Bullet lengths are balanced." });
      }
    }
  }

  // ==========================================
  // DIMENSION 3: TECHNICAL CREDIBILITY (Max 100)
  // ==========================================
  let techSpecScore = 5;
  const specificTools = /(studio 5000|control logix|slc 500|compactlogix|micrologix|rslogix|factorytalk|wonderware|system platform|step 7|s7-1200|s7-1500|beckhoff twincat|ignition scada|node\.js|next\.js|kubernetes|aws s3|dynamodb|docker compose|react native|salesforce|quickbooks|tableau|power bi|excel|ga4|google analytics|google ads|photoshop|illustrator|figma|jira|confluence|slack|trello)/i;
  
  if (specificTools.test(resumeText)) {
    techSpecScore = 25;
    suggestions.push({ dim: 'technical', status: 'pass', text: "Technical: Mentions industry-specific products and tools." });
  } else {
    suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: Specify software tools or technologies (e.g. 'Tableau', 'Excel') instead of generic categories." });
  }

  // 2. Skill Depth (20 points)
  let techDepthScore = 5;
  if (skills) {
    const linesCount = skills.split('\n').filter(l => l.trim()).length;
    if (linesCount >= 12) techDepthScore = 20;
    else if (linesCount >= 8) techDepthScore = 15;
    else if (linesCount >= 4) techDepthScore = 10;

    if (techDepthScore >= 15) {
      suggestions.push({ dim: 'technical', status: 'pass', text: `Technical: Excellent skills breakdown with ${linesCount} categorizations.` });
    } else {
      suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: List at least 8 specific skill categorization rows." });
    }
  } else {
    suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: Technical Skills section is empty." });
  }

  // 3. Industry Alignment (25 points)
  let techAlignScore = 25;
  if (jdText && jdKeywords.length > 0) {
    const totalJd = criticalList.length + importantList.length;
    if (totalJd > 0) {
      const matchedJd = criticalMatchedList.length + importantMatchedList.length;
      techAlignScore = Math.round((matchedJd / totalJd) * 25);
      if (techAlignScore >= 18) {
        suggestions.push({ dim: 'technical', status: 'pass', text: "Technical: Core skills are highly aligned with the Job Description requirements." });
      } else {
        suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: Core skills are generic. Align keywords to match Job Description domain." });
      }
    }
  } else {
    techAlignScore = 25;
  }

  // 4. Achievement Credibility (20 points)
  let techCredScore = 20;
  const roundPct = /\b(100|50|20|30|40|60|70|80|90)%/g;
  const roundMatches = resumeText.match(roundPct) || [];
  if (roundMatches.length > 0) {
    techCredScore = Math.max(5, techCredScore - (roundMatches.length * 5));
    suggestions.push({ dim: 'technical', status: 'fail', text: `Technical: Avoid round percentage values (e.g. ${roundMatches[0]}) without contextual proof.` });
  } else {
    suggestions.push({ dim: 'technical', status: 'pass', text: "Technical: Achievement metrics are realistic and credible." });
  }

  // 5. Ownership Signals (10 points)
  let techOwnerScore = 0;
  const ownershipVerbs = /\b(led|spearheaded|managed|owned|commissioned|designed and implemented|architected)\b/g;
  const matchesOwnership = [...new Set(resumeText.match(ownershipVerbs) || [])];
  if (matchesOwnership.length >= 4) techOwnerScore = 10;
  else if (matchesOwnership.length >= 2) techOwnerScore = 7;
  else if (matchesOwnership.length === 1) techOwnerScore = 4;

  if (techOwnerScore >= 7) {
    suggestions.push({ dim: 'technical', status: 'pass', text: "Technical: Work bullet points emphasize clear project ownership and design roles." });
  } else {
    suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: Add ownership verbs (e.g., 'led', 'designed', 'architected') to show authority." });
  }

  // ==========================================
  // COMPOSITE & UI UPDATES
  // ==========================================
  const finalAtsScore = Math.round(kwRelevanceScore + structureScore + dateScore + formatScore + expAlignScore + eduAlignScore);
  const finalRecruiterScore = Math.round(recSummaryScore + recExpScore + recQuantScore + recProgScore + recReadScore);
  const finalTechnicalScore = Math.round(techSpecScore + techDepthScore + techAlignScore + techCredScore + techOwnerScore);

  const compositeScore = Math.round((finalAtsScore * 0.40) + (finalRecruiterScore * 0.35) + (finalTechnicalScore * 0.25));

  // Determine Match Level
  let matchLevel = "Weak";
  let matchClass = "match-level-weak";
  if (compositeScore >= 85) {
    matchLevel = "Excellent";
    matchClass = "match-level-excellent";
  } else if (compositeScore >= 70) {
    matchLevel = "Strong";
    matchClass = "match-level-strong";
  } else if (compositeScore >= 50) {
    matchLevel = "Moderate";
    matchClass = "match-level-moderate";
  }

  document.getElementById('overall-score-badge').textContent = `${compositeScore}/100`;
  document.getElementById('overall-score-pct').textContent = `${compositeScore}%`;
  
  const ringFill = document.getElementById('overall-radial-fill');
  if (ringFill) {
    ringFill.setAttribute('stroke-dasharray', `${compositeScore}, 100`);
    if (compositeScore < 50) {
      ringFill.style.stroke = '#dc2626';
    } else if (compositeScore < 75) {
      ringFill.style.stroke = '#ca8a04';
    } else {
      ringFill.style.stroke = '#0052cc';
    }
  }

  document.getElementById('ats-score-val').textContent = `${finalAtsScore}/100`;
  document.getElementById('ats-score-bar').style.width = `${finalAtsScore}%`;
  
  document.getElementById('recruiter-score-val').textContent = `${finalRecruiterScore}/100`;
  document.getElementById('recruiter-score-bar').style.width = `${finalRecruiterScore}%`;
  
  document.getElementById('technical-score-val').textContent = `${finalTechnicalScore}/100`;
  document.getElementById('technical-score-bar').style.width = `${finalTechnicalScore}%`;

  const kwFeedback = document.getElementById('keyword-feedback');
  if (jdText && kwFeedback) {
    kwFeedback.style.display = 'block';
    
    const rate = jdKeywords.length > 0 ? Math.round((matchedKeywords.length / jdKeywords.length) * 100) : 0;
    document.getElementById('keyword-match-rate').textContent = `${rate}%`;
    document.getElementById('keyword-match-count').textContent = `${matchedKeywords.length} of ${jdKeywords.length} keywords`;

    const matchedContainer = document.getElementById('matched-kw-tags');
    matchedContainer.innerHTML = [
      ...criticalMatchedList.map(k => `<span class="kw-tag match critical" title="Critical Requirement">${escHtml(k)} (C)</span>`),
      ...importantMatchedList.map(k => `<span class="kw-tag match important" title="Important Requirement">${escHtml(k)} (I)</span>`),
      ...preferredMatchedList.map(k => `<span class="kw-tag match preferred" title="Preferred Requirement">${escHtml(k)} (P)</span>`)
    ].join('');

    const missingContainer = document.getElementById('missing-kw-tags');
    missingContainer.innerHTML = [
      ...criticalMissingList.map(k => `<span class="kw-tag missing critical" title="Critical Requirement">${escHtml(k)} (C)</span>`),
      ...importantMissingList.map(k => `<span class="kw-tag missing important" title="Important Requirement">${escHtml(k)} (I)</span>`),
      ...preferredMissingList.map(k => `<span class="kw-tag missing preferred" title="Preferred Requirement">${escHtml(k)} (P)</span>`)
    ].join('');
  } else if (kwFeedback) {
    kwFeedback.style.display = 'none';
  }

  const listContainer = document.getElementById('suggestions-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    
    let html = '';
    html += `<div class="match-level-badge ${matchClass}">Match Level: ${matchLevel}</div>`;

    const passed = suggestions.filter(s => s.status === 'pass');
    html += `
      <div class="suggestion-group">
        <div class="group-title strengths">Strengths (${passed.length})</div>
        <ul class="suggestions-list">
          ${passed.length > 0 ? passed.map(s => `
            <li class="suggestion-pass">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="flex-shrink:0; margin-top:2px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <span>${escHtml(s.text)}</span>
            </li>
          `).join('') : '<li class="empty-suggestions">No key strengths identified yet. Optimize your resume structure.</li>'}
        </ul>
      </div>
    `;

    const failed = suggestions.filter(s => s.status === 'fail');
    html += `
      <div class="suggestion-group" style="margin-top: 14px;">
        <div class="group-title weaknesses">Weaknesses & Actionable Improvements (${failed.length})</div>
        <ul class="suggestions-list">
          ${failed.length > 0 ? failed.map(s => `
            <li class="suggestion-fail">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="flex-shrink:0; margin-top:2px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>${escHtml(s.text)}</span>
            </li>
          `).join('') : '<li class="suggestion-pass" style="justify-content:center; width:100%; font-weight:600;">✓ Excellent! Your resume conforms to all ATS, Recruiter, and Technical guidelines.</li>'}
        </ul>
      </div>
    `;
    listContainer.innerHTML = html;
  }
}

// Populate company copy buttons and preview on load
window.addEventListener('DOMContentLoaded', () => {
  initProfiles();
});