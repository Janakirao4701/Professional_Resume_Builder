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
  const summaryRx   = /\[(?:SUMMARY|PROFESSIONAL SUMMARY)\]([\s\S]*?)(?=\[|$)/i;
  const skillsRx    = /\[(?:SKILLS|TECHNICAL SKILLS)\]([\s\S]*?)(?=\[|$)/i;
  const experienceRx= /\[(?:EXPERIENCE|PROFESSIONAL EXPERIENCE)\]([\s\S]*?)(?=\[|$)/i;
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

    btn.innerHTML = '✓ Pasted!';
    btn.classList.add('pasted');
    setTimeout(() => {
      btn.innerHTML = '📋 Paste from Clipboard';
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
  let atsScore = 0;

  // 1. Keyword Match Rate (40 points)
  let kwScore = 0;
  let jdKeywords = [];
  let matchedKeywords = [];
  let missingKeywords = [];

  if (jdText) {
    const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'you', 'our', 'are', 'this', 'that', 'will', 'work', 'team', 'from', 'your', 'have', 'their', 'they', 'them', 'who', 'what', 'its', 'about', 'been', 'were', 'was', 'has', 'had', 'does', 'did', 'but', 'not', 'can', 'should', 'would', 'could', 'than', 'then', 'into', 'onto', 'upon', 'also', 'other', 'some', 'such', 'only', 'very', 'more', 'most', 'any', 'each', 'both', 'all', 'one', 'two', 'new', 'old', 'good', 'best', 'well', 'etc', 'under', 'role', 'highly', 'required', 'skills', 'experience', 'ability', 'duties', 'responsibilities', 'project', 'support', 'management', 'technical', 'development']);
    const TECH_TERMS = new Set(['plc', 'hmi', 'scada', 'studio', '5000', 'rslogix', 'controllogix', 'siemens', 'beckhoff', 'twincat', 'ignition', 'factorytalk', 'panels', 'wiring', 'cad', 'eplan', 'autocad', 'python', 'javascript', 'typescript', 'react', 'node', 'express', 'nextjs', 'aws', 'docker', 'kubernetes', 'git', 'sql', 'mysql', 'postgres', 'mongodb', 'redis', 'c#', 'java', 'c++', 'testing', 'automation', 'commissioning', 'engineering', 'controls', 'systems', 'integration', 'vfd', 'servo', 'ethernet', 'modbus', 'profibus', 'devicenet', 'rs232', 'calibration', 'troubleshooting', 'maintenance', 'safety', 'compliance']);

    // Extract potential keywords from JD
    const jdWords = jdText.toLowerCase().match(/[a-z0-9+#\-]+/g) || [];
    const freq = {};
    jdWords.forEach(w => {
      if (w.length >= 3 && !STOP_WORDS.has(w)) {
        freq[w] = (freq[w] || 0) + 1;
      }
    });

    // Select unique keywords, prioritizing tech terms and high-frequency terms
    const candidates = Object.keys(freq).sort((a, b) => {
      const aIsTech = TECH_TERMS.has(a) ? 1 : 0;
      const bIsTech = TECH_TERMS.has(b) ? 1 : 0;
      if (aIsTech !== bIsTech) return bIsTech - aIsTech;
      return freq[b] - freq[a];
    });

    jdKeywords = candidates.slice(0, 15); // Top 15 keywords

    if (jdKeywords.length > 0) {
      const resumeLower = resumeText.toLowerCase();
      jdKeywords.forEach(kw => {
        const regex = new RegExp('\\b' + kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
        if (regex.test(resumeLower)) {
          matchedKeywords.push(kw);
        } else {
          missingKeywords.push(kw);
        }
      });
      kwScore = Math.round((matchedKeywords.length / jdKeywords.length) * 40);
    }
  } else {
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Paste a Job Description to calculate Keyword Match Rate." });
  }
  atsScore += kwScore;

  // 2. Date Format Compliance (10 points)
  let dateScore = 0;
  const dateRegex = /\b(0[1-9]|1[0-2])\/\d{4}\b/g; // MM/YYYY
  const datesFound = resumeText.match(dateRegex) || [];
  const textHasDates = /\b(19|20)\d{2}\b/.test(resumeText);
  
  if (datesFound.length > 0) {
    dateScore = 10;
  } else if (textHasDates) {
    dateScore = 5;
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Ensure all dates in Professional Experience use the standard MM/YYYY format (e.g., 06/2021)." });
  } else {
    dateScore = 0;
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: No experience dates detected. Add dates using the MM/YYYY format." });
  }
  atsScore += dateScore;

  // 3. Section Header Compliance (15 points)
  let headerScore = 0;
  const hasSummary = /\[(?:SUMMARY|PROFESSIONAL SUMMARY)\]/i.test(resumeText);
  const hasSkills = /\[(?:SKILLS|TECHNICAL SKILLS)\]/i.test(resumeText);
  const hasExperience = /\[(?:EXPERIENCE|PROFESSIONAL EXPERIENCE)\]/i.test(resumeText);
  
  if (hasSummary) headerScore += 5;
  if (hasSkills) headerScore += 5;
  if (hasExperience) headerScore += 5;

  if (headerScore < 15) {
    const missing = [];
    if (!hasSummary) missing.push('[PROFESSIONAL SUMMARY]');
    if (!hasSkills) missing.push('[TECHNICAL SKILLS]');
    if (!hasExperience) missing.push('[PROFESSIONAL EXPERIENCE]');
    suggestions.push({ dim: 'ats', status: 'fail', text: `ATS: Missing required section tags: ${missing.join(', ')}.` });
  }
  atsScore += headerScore;

  // 4. Acronym Handling (10 points)
  let acronymScore = 10;
  const acronyms = ['PLC', 'HMI', 'SCADA', 'VFD', 'CAD', 'AWS', 'API', 'SQL', 'ATS'];
  let foundAcronyms = 0;
  let spelledOut = 0;

  acronyms.forEach(ac => {
    const regex = new RegExp('\\b' + ac + '\\b');
    if (regex.test(resumeText)) {
      foundAcronyms++;
      const bracketRegex = new RegExp('(?:' + ac + '\\s*\\([^)]+\\)|\\([^)]+\\)\\s*' + ac + ')', 'i');
      if (bracketRegex.test(resumeText)) {
        spelledOut++;
      }
    }
  });

  if (foundAcronyms > 0) {
    if (spelledOut === 0) {
      acronymScore = 0;
      suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Acronyms detected (e.g. PLC). Spell out acronyms on first use (e.g. PLC (Programmable Logic Controller))." });
    } else if (spelledOut < foundAcronyms) {
      acronymScore = 5;
      suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Some acronyms are not spelled out on first use." });
    }
  }
  atsScore += acronymScore;

  // 5. Format Cleanliness (15 points)
  let cleanlinessScore = 15;
  const bulletsLines = resumeText.split('\n').map(l => l.trim()).filter(l => /^[-\u2013\u2014\u2022•*]/.test(l));
  const badBullets = bulletsLines.filter(l => !/^-/.test(l));
  
  if (bulletsLines.length > 0 && badBullets.length > 0) {
    cleanlinessScore -= 5;
    suggestions.push({ dim: 'ats', status: 'fail', text: "ATS: Mixed bullet point formats. Ensure all experience list items start with a plain hyphen '-'." });
  }
  atsScore += cleanlinessScore;

  // 6. Forbidden Headers Penalty (-10 points each)
  let forbiddenPenalty = 0;
  const forbiddenHeaders = ['objective', 'about me', 'references'];
  forbiddenHeaders.forEach(fh => {
    const regex = new RegExp('\\b' + fh + '\\b', 'i');
    if (regex.test(resumeText)) {
      forbiddenPenalty += 10;
      suggestions.push({ dim: 'ats', status: 'fail', text: `ATS Penalty: Remove forbidden header/concept '${fh}' (Objective statements and references are outdated).` });
    }
  });
  atsScore = Math.max(0, atsScore - forbiddenPenalty);

  // ==========================================
  // DIMENSION 2: RECRUITER APPEAL (Max 100)
  // ==========================================
  let recruiterScore = 0;

  // 1. Summary Quality (25 points)
  let summaryScore = 0;
  if (summary) {
    const hasYoe = /\d+\+?\s*(years|yoe)/i.test(summary);
    const hasJobTitle = /(engineer|developer|designer|analyst|programmer)/i.test(summary);
    if (hasYoe && hasJobTitle) summaryScore += 5;
    else suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Summary should open with target job title and YOE (e.g. 'Controls Engineer with 5+ years...')." });

    const summaryWords = summary.toLowerCase();
    const hasTools = /(plc|siemens|studio|allen|rockwell|python|react|aws|docker|sql|cad|ignition)/i.test(summaryWords);
    if (hasTools) summaryScore += 5;
    else suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Feature at least 2 key tools or technologies in your professional summary." });

    const hasIndustries = /(automotive|manufacturing|oil|gas|chemical|aerospace|utility|logistics|software|tech|medical|water)/i.test(summaryWords);
    if (hasIndustries) summaryScore += 5;
    else suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Mention your primary domain or target industry sectors in your summary." });

    const hasProblemSolve = /(solve|solving|implement|reduce|optimise|optimize|increase|improve|streamline)/i.test(summaryWords);
    if (hasProblemSolve) summaryScore += 5;

    const clichés = ['passionate', 'results-driven', 'detail-oriented', 'self-starter', 'motivated', 'hardworking'];
    let foundCliche = false;
    clichés.forEach(c => {
      if (summaryWords.includes(c)) foundCliche = true;
    });
    if (!foundCliche) summaryScore += 5;
    else suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Remove subjective buzzwords (e.g. 'passionate', 'results-driven') from summary; replace with hard facts." });
  } else {
    suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Summary block is empty. Write an impactful 3-line professional summary." });
  }
  recruiterScore += summaryScore;

  // 2. Bullet Quality (30 points)
  let bulletScore = 0;
  if (experience) {
    const bullets = experience.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'));
    let strongBulletsCount = 0;
    let bannedVerbsCount = 0;

    const strongVerbs = /\b(designed|engineered|programmed|automated|commissioned|optimized|led|developed|reduced|increased|implemented|spearheaded|developed|configured|authored)\b/i;
    const bannedVerbs = /\b(collaborated|responsible for|helped|supported|worked on)\b/i;

    bullets.forEach(b => {
      if (strongVerbs.test(b)) strongBulletsCount++;
      if (bannedVerbs.test(b)) bannedVerbsCount++;
    });

    bulletScore = Math.min(30, strongBulletsCount * 4);
    
    if (bannedVerbsCount > 0) {
      bulletScore = Math.max(0, bulletScore - (bannedVerbsCount * 2));
      suggestions.push({ dim: 'recruiter', status: 'fail', text: `Recruiter: Detected ${bannedVerbsCount} weak/passive verbs (e.g. 'helped', 'worked on'). Replace them with action verbs.` });
    }
  }
  recruiterScore += bulletScore;

  // 3. Job Title Accuracy (15 points)
  let titleScore = 15;
  if (jdText) {
    const jdTitleMatch = jdText.match(/(?:title|role):\s*([^\n]+)/i) || [null, jdText.substring(0, 30)];
    const targetTitle = jdTitleMatch[1] ? jdTitleMatch[1].trim().toLowerCase() : "";
    const currentTitle = (p.subtitle || "").toLowerCase();

    if (currentTitle && targetTitle) {
      if (currentTitle === targetTitle) {
        titleScore = 15;
      } else if (targetTitle.split(/\s+/).some(word => word.length > 3 && currentTitle.includes(word))) {
        titleScore = 8;
        suggestions.push({ dim: 'recruiter', status: 'fail', text: `Recruiter: Profile subtitle '${p.subtitle}' is a partial match. Align it exactly to target role.` });
      } else {
        titleScore = 0;
        suggestions.push({ dim: 'recruiter', status: 'fail', text: `Recruiter: Profile subtitle mismatch. Current: '${p.subtitle || 'None'}'. Target: '${jdTitleMatch[1] || 'Unknown'}'.` });
      }
    }
  }
  recruiterScore += titleScore;

  // 4. Career Progression Clarity (15 points)
  let progressionScore = 15;
  const gapRegex = /gap/i;
  if (gapRegex.test(resumeText)) {
    progressionScore = 5;
    suggestions.push({ dim: 'recruiter', status: 'fail', text: "Recruiter: Ensure career gaps or shifts are logical and have clear context." });
  }
  recruiterScore += progressionScore;

  // 5. Bullet Count Per Role (15 points)
  let countScore = 0;
  if (experience) {
    const roles = experience.split(/(?=[^|\n]+\|[^\n]+\|[^\n]+\|[^\n]+)/);
    if (roles.length > 0) {
      const firstBullets = (roles[0] || "").split('\n').filter(l => l.trim().startsWith('-'));
      if (firstBullets.length >= 7 && firstBullets.length <= 8) countScore += 5;
      else suggestions.push({ dim: 'recruiter', status: 'fail', text: `Recruiter: Target 7-8 bullets for your present/most recent role (currently: ${firstBullets.length}).` });

      if (roles.length > 1) {
        const secondBullets = (roles[1] || "").split('\n').filter(l => l.trim().startsWith('-'));
        if (secondBullets.length >= 6 && secondBullets.length <= 7) countScore += 5;
        else suggestions.push({ dim: 'recruiter', status: 'fail', text: `Recruiter: Target 6-7 bullets for your previous role (currently: ${secondBullets.length}).` });
      } else {
        countScore += 5;
      }

      if (roles.length > 2) {
        const thirdBullets = (roles[2] || "").split('\n').filter(l => l.trim().startsWith('-'));
        if (thirdBullets.length >= 5 && thirdBullets.length <= 6) countScore += 5;
        else suggestions.push({ dim: 'recruiter', status: 'fail', text: `Recruiter: Target 5-6 bullets for your older roles (currently: ${thirdBullets.length}).` });
      } else {
        countScore += 5;
      }
    }
  }
  recruiterScore += countScore;

  // ==========================================
  // DIMENSION 3: TECHNICAL CREDIBILITY (Max 100)
  // ==========================================
  let technicalScore = 0;

  // 1. Tool Specificity (25 points)
  let specScore = 5;
  const specificTools = /(studio 5000|control logix|slc 500|compactlogix|micrologix|rslogix|factorytalk|wonderware|system platform|step 7|s7-1200|s7-1500|beckhoff twincat|ignition scada|node\.js|next\.js|kubernetes|aws s3|dynamodb|docker compose|react native)/i;
  
  if (specificTools.test(resumeText)) {
    specScore = 25;
  } else {
    suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: Specify exact software versions or products (e.g. 'Studio 5000', 'TwinCAT') rather than generic terms like 'PLC software'." });
  }
  technicalScore += specScore;

  // 2. Metric Defensibility (25 points)
  let metricScore = 0;
  const hasNumbers = /\b\d+\b/g;
  const hasPercentage = /\b\d+%/g;
  const numbers = resumeText.match(hasNumbers) || [];
  const percentages = resumeText.match(hasPercentage) || [];

  if (numbers.length > 0) {
    if (percentages.length > 0 && percentages.length === numbers.length) {
      metricScore = 10;
      suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: Resume contains percentages only. Add count-based metrics (e.g. 'commissioned 12 panels') to establish baselines." });
    } else {
      metricScore = 25;
    }
  } else {
    metricScore = 0;
    suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: No defensible metrics found. Incorporate quantities (defect counts, commissioning times) to substantiate impact." });
  }

  const roundPct = /\b(100|50|10|20|30|40|60|70|80|90)%/g;
  const roundMatches = resumeText.match(roundPct) || [];
  if (roundMatches.length > 0) {
    metricScore = Math.max(0, metricScore - (roundMatches.length * 5));
    suggestions.push({ dim: 'technical', status: 'fail', text: `Technical Penalty: Avoid clean round-number percentages (e.g. ${roundMatches[0]}) without contextual proof.` });
  }
  technicalScore += metricScore;

  // 3. Industry Alignment (20 points)
  let industryScore = 5;
  const alignmentKeywords = /(commissioning|wiring|hmi|scada|control panel|wiring schematics|fat|sat|safety protocols|field testing|rest api|microservices|ci\/cd|pipeline)/i;
  
  if (alignmentKeywords.test(resumeText)) {
    industryScore = 20;
  } else {
    suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: Bullets are generic. Inject domain-specific terms (e.g., schematics, SAT, microservices) to align with target industry." });
  }
  technicalScore += industryScore;

  // 4. Credibility Signals (20 points)
  let signalScore = 0;
  const ownershipVerbs = /\b(led|spearheaded|managed|owned|commissioned|designed and implemented)\b/i;
  const matchesOwnership = resumeText.match(ownershipVerbs) || [];
  signalScore += Math.min(15, matchesOwnership.length * 5);

  const crossFunc = /(cross-functional|client|operators|electricians|stakeholders|vendors|product managers)/i;
  if (crossFunc.test(resumeText)) {
    signalScore += 5;
  } else {
    suggestions.push({ dim: 'technical', status: 'fail', text: "Technical: Include cross-functional collaborate bullets (e.g. coordinate with electricians, operators, PMs)." });
  }
  technicalScore += signalScore;

  // 5. Skill Depth (10 points)
  let depthScore = 10;
  if (skills) {
    const linesCount = skills.split('\n').filter(l => l.trim()).length;
    if (linesCount < 8) {
      depthScore = Math.round(linesCount * 1.25);
      suggestions.push({ dim: 'technical', status: 'fail', text: `Technical: List at least 8 specific skill categorisation rows (currently: ${linesCount}).` });
    }
  } else {
    depthScore = 0;
  }
  technicalScore += depthScore;

  // ==========================================
  // COMPOSITE & UI UPDATES
  // ==========================================
  const compositeScore = Math.round((atsScore * 0.35) + (recruiterScore * 0.35) + (technicalScore * 0.30));

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

  document.getElementById('ats-score-val').textContent = `${atsScore}/100`;
  document.getElementById('ats-score-bar').style.width = `${atsScore}%`;
  
  document.getElementById('recruiter-score-val').textContent = `${recruiterScore}/100`;
  document.getElementById('recruiter-score-bar').style.width = `${recruiterScore}%`;
  
  document.getElementById('technical-score-val').textContent = `${technicalScore}/100`;
  document.getElementById('technical-score-bar').style.width = `${technicalScore}%`;

  const kwFeedback = document.getElementById('keyword-feedback');
  if (jdText && kwFeedback) {
    kwFeedback.style.display = 'block';
    
    const rate = jdKeywords.length > 0 ? Math.round((matchedKeywords.length / jdKeywords.length) * 100) : 0;
    document.getElementById('keyword-match-rate').textContent = `${rate}%`;
    document.getElementById('keyword-match-count').textContent = `${matchedKeywords.length} of ${jdKeywords.length} keywords`;

    const matchedContainer = document.getElementById('matched-kw-tags');
    matchedContainer.innerHTML = matchedKeywords.map(k => `<span class="kw-tag match">${escHtml(k)}</span>`).join('');

    const missingContainer = document.getElementById('missing-kw-tags');
    missingContainer.innerHTML = missingKeywords.map(k => `<span class="kw-tag missing">${escHtml(k)}</span>`).join('');
  } else if (kwFeedback) {
    kwFeedback.style.display = 'none';
  }

  const listContainer = document.getElementById('suggestions-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    const failedOnly = suggestions.filter(s => s.status === 'fail');
    
    if (failedOnly.length === 0) {
      listContainer.innerHTML = `<li class="suggestion-pass" style="justify-content:center; width:100%; font-weight:600;">✓ Excellent! Your resume conforms to all ATS, Recruiter, and Technical guidelines.</li>`;
    } else {
      listContainer.innerHTML = failedOnly.map(s => {
        return `<li class="suggestion-fail">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="flex-shrink:0; margin-top:2px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>${escHtml(s.text)}</span>
        </li>`;
      }).join('');
    }
  }
}

// Populate company copy buttons and preview on load
window.addEventListener('DOMContentLoaded', () => {
  initProfiles();
});