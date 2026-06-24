// ── MULTI-PROFILE STORAGE AND MANAGEMENT ──
let profiles = {};
let currentProfileId = 'default';

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

let saveToStorageTimeout = null;
function saveToStorage() {
  clearTimeout(saveToStorageTimeout);
  saveToStorageTimeout = setTimeout(() => {
    localStorage.setItem('resume_builder_profiles', JSON.stringify(profiles));
  }, 250);
}

function saveToStorageImmediate() {
  clearTimeout(saveToStorageTimeout);
  localStorage.setItem('resume_builder_profiles', JSON.stringify(profiles));
}

// ── CUSTOM ACCESSIBLE DIALOG MODAL HELPER ──
function customConfirm(title, message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('custom-modal-dialog');
    if (!dialog) {
      resolve(confirm(message));
      return;
    }
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal-input-wrapper').style.display = 'none';
    
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const triggerEl = document.activeElement;
    
    function cleanup() {
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onClose);
      if (triggerEl) triggerEl.focus();
    }
    
    function onConfirm() {
      cleanup();
      dialog.close();
      resolve(true);
    }
    
    function onCancel() {
      cleanup();
      dialog.close();
      resolve(false);
    }
    
    function onClose() {
      cleanup();
      resolve(false);
    }
    
    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    dialog.addEventListener('close', onClose);
    
    dialog.showModal();
    confirmBtn.focus();
  });
}

function customPrompt(title, defaultValue = '') {
  return new Promise((resolve) => {
    const dialog = document.getElementById('custom-modal-dialog');
    if (!dialog) {
      resolve(prompt(title, defaultValue));
      return;
    }
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = '';
    document.getElementById('modal-input-wrapper').style.display = 'block';
    
    const inputField = document.getElementById('modal-input-field');
    inputField.value = defaultValue;
    
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const errorSpan = document.getElementById('modal-input-error');
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }
    
    const triggerEl = document.activeElement;
    
    function cleanup() {
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onClose);
      inputField.removeEventListener('keydown', onKeyDown);
      if (triggerEl) triggerEl.focus();
    }
    
    function onConfirm() {
      const val = inputField.value;
      cleanup();
      dialog.close();
      resolve(val);
    }
    
    function onCancel() {
      cleanup();
      dialog.close();
      resolve(null);
    }
    
    function onClose() {
      cleanup();
      resolve(null);
    }
    
    function onKeyDown(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    }
    
    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    dialog.addEventListener('close', onClose);
    inputField.addEventListener('keydown', onKeyDown);
    
    dialog.showModal();
    inputField.focus();
    if (defaultValue) {
      inputField.select();
    }
  });
}

// Focus trapping helper for drawer
function trapFocusInDrawer(e) {
  const drawer = document.getElementById('profile-drawer');
  if (!drawer || !drawer.classList.contains('active')) return;
  
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = drawer.querySelectorAll(focusableSelectors);
  if (focusableElements.length === 0) return;
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  if (e.key === 'Tab') {
    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }
}

// Add event listener to trap focus and handle Esc key for drawer
window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    trapFocusInDrawer(e);
  } else if (e.key === 'Escape') {
    const drawer = document.getElementById('profile-drawer');
    if (drawer && drawer.classList.contains('active')) {
      toggleDetailsForm();
    }
  }
});

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
    } else {
      p.profile.education = p.profile.education.filter(e => e && typeof e === 'object').map(e => ({
        degree: typeof e.degree === 'string' ? e.degree : '',
        school: typeof e.school === 'string' ? e.school : '',
        dates: typeof e.dates === 'string' ? e.dates : '',
        location: typeof e.location === 'string' ? e.location : ''
      }));
    }
    if (!p.profile.certs || !Array.isArray(p.profile.certs)) {
      p.profile.certs = [];
    } else {
      p.profile.certs = p.profile.certs.filter(c => c !== null && c !== undefined).map(c => String(c));
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
  
  // Set textarea content
  const textarea = document.getElementById('resume-text');
  if (textarea) {
    textarea.value = profiles[currentProfileId].text || '';
  }
  
  updateProfileSelectDropdown();
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreview();

  if (profiles[currentProfileId] && profiles[currentProfileId].ats_results) {
    renderScoringUI(profiles[currentProfileId].ats_results);
  } else {
    clearScoringUI();
  }
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
  if (profiles[currentProfileId]) {
    profiles[currentProfileId].text = textareaVal;
  }
  
  // Switch
  currentProfileId = profileId;
  localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
  saveToStorageImmediate();
  
  // Sync select dropdowns
  const select = document.getElementById('profile-select');
  if (select) select.value = currentProfileId;
  const mobileSelect = document.getElementById('mobile-profile-select');
  if (mobileSelect) mobileSelect.value = currentProfileId;
  
  // Update UI
  document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreviewImmediate();

  if (profiles[currentProfileId] && profiles[currentProfileId].ats_results) {
    renderScoringUI(profiles[currentProfileId].ats_results);
  } else {
    clearScoringUI();
  }
}

async function createNewProfile() {
  const name = await customPrompt("Enter a label/identifier for the new profile (e.g. 'Software_Engineer'):");
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
  saveToStorageImmediate();
  updateProfileSelectDropdown();
  document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreviewImmediate();
  clearScoringUI();
  showToast("Created blank profile: " + cleanLabel);
  
  // Auto-expand drawer for the new profile
  const drawer = document.getElementById('profile-drawer');
  if (!drawer.classList.contains('active')) {
    toggleDetailsForm();
  }
}

async function duplicateCurrentProfile() {
  const name = await customPrompt("Enter a label/identifier for the duplicated profile (e.g. 'Software_Engineer_Copy'):");
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
  saveToStorageImmediate();
  updateProfileSelectDropdown();
  document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreviewImmediate();
  
  if (profiles[currentProfileId] && profiles[currentProfileId].ats_results) {
    renderScoringUI(profiles[currentProfileId].ats_results);
  } else {
    clearScoringUI();
  }
  showToast("Duplicated profile to: " + cleanLabel);
}

async function renameCurrentProfile() {
  const newLabel = await customPrompt("Enter a new label for the active profile:", currentProfileId);
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
    localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
    saveToStorageImmediate();
    updateProfileSelectDropdown();
    showToast(`Renamed profile from "${oldLabel}" to "${cleanLabel}"`);
  }
}

let deleteConfirmTimeout = null;

function deleteCurrentProfileConfirm(event, btnId = 'delete-profile-btn') {
  if (event) event.stopPropagation();
  
  const btn = document.getElementById(btnId);
  if (!btn) return;
  
  const span = btn.querySelector('span');
  
  if (btn.classList.contains('confirming')) {
    clearTimeout(deleteConfirmTimeout);
    btn.classList.remove('confirming');
    if (span) span.textContent = btn.dataset.originalText || 'Delete';
    performProfileDelete();
    if (btnId === 'mobile-delete-profile-btn') {
      toggleMobileMenu(false);
    }
  } else {
    // Save original text
    if (span && !btn.dataset.originalText) {
      btn.dataset.originalText = span.textContent;
    }
    btn.classList.add('confirming');
    if (span) span.textContent = 'Confirm Delete?';
    
    deleteConfirmTimeout = setTimeout(() => {
      btn.classList.remove('confirming');
      if (span) span.textContent = btn.dataset.originalText || 'Delete';
    }, 3000);
  }
}

function performProfileDelete() {
  const keys = Object.keys(profiles);
  if (keys.length <= 1) {
    showToast("You must keep at least one profile.");
    return;
  }
  const targetId = currentProfileId;
  delete profiles[targetId];
  currentProfileId = Object.keys(profiles)[0];
  localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
  saveToStorageImmediate();
  updateProfileSelectDropdown();
  document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreviewImmediate();
  
  if (profiles[currentProfileId] && profiles[currentProfileId].ats_results) {
    renderScoringUI(profiles[currentProfileId].ats_results);
  } else {
    clearScoringUI();
  }
  showToast(`Deleted profile "${targetId}"`);
}

async function deleteCurrentProfile() {
  const targetId = currentProfileId;
  const confirmResult = await customConfirm("Delete Profile", `Are you sure you want to delete the profile "${targetId}"?`);
  if (confirmResult) {
    performProfileDelete();
  }
}

// ── HEADER ACTIONS DROPDOWN ──
function toggleHdrDropdown(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('hdr-dropdown-menu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

function closeHdrDropdown() {
  const menu = document.getElementById('hdr-dropdown-menu');
  if (menu) {
    menu.classList.remove('show');
  }
}

// Close dropdown when user clicks outside
window.addEventListener('click', () => {
  closeHdrDropdown();
});

function toggleDetailsForm() {
  const drawer = document.getElementById('profile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const btn = document.getElementById('toggle-details-btn');
  
  if (!drawer.classList.contains('active')) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    btn.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    if (window.location.hash !== '#profile-details') {
      window.history.pushState({ drawerOpen: true }, '', '#profile-details');
    }
  } else {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    btn.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    if (window.location.hash === '#profile-details') {
      window.history.back();
    }
  }
}

window.addEventListener('popstate', () => {
  const drawer = document.getElementById('profile-drawer');
  if (drawer && drawer.classList.contains('active')) {
    drawer.classList.remove('active');
    const overlay = document.getElementById('drawer-overlay');
    if (overlay) overlay.classList.remove('active');
    const btn = document.getElementById('toggle-details-btn');
    if (btn) btn.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
  }
});

function updateProfileField(field, value) {
  const errSpan = document.getElementById(`error-prof-${field}`);
  if (errSpan) {
    if (field === 'email' && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      errSpan.textContent = 'Please enter a valid email address.';
      errSpan.style.display = 'block';
    } else if (field === 'linkedin' && value.trim() && !/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i.test(value.trim()) && !/^linkedin\.com\/.*$/i.test(value.trim())) {
      errSpan.textContent = 'Please enter a valid LinkedIn URL.';
      errSpan.style.display = 'block';
    } else {
      errSpan.textContent = '';
      errSpan.style.display = 'none';
    }
  }
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
  updatePreviewImmediate();
}

function removeEducationRow(index) {
  profiles[currentProfileId].profile.education.splice(index, 1);
  saveToStorage();
  renderFormFields();
  updatePreviewImmediate();
}

function addCertRow() {
  if (!profiles[currentProfileId].profile.certs) profiles[currentProfileId].profile.certs = [];
  profiles[currentProfileId].profile.certs.push('');
  saveToStorage();
  renderFormFields();
  updatePreviewImmediate();
}

function removeCertRow(index) {
  profiles[currentProfileId].profile.certs.splice(index, 1);
  saveToStorage();
  renderFormFields();
  updatePreviewImmediate();
}

function renderFormFields() {
  if (!profiles[currentProfileId]) {
    profiles[currentProfileId] = { profile: {}, text: '' };
  }
  const p = profiles[currentProfileId].profile || {};
  
  const nameInput = document.getElementById('prof-name');
  if (nameInput) nameInput.value = p.name || '';
  const subtitleInput = document.getElementById('prof-subtitle');
  if (subtitleInput) subtitleInput.value = p.subtitle || '';
  const emailInput = document.getElementById('prof-email');
  if (emailInput) emailInput.value = p.email || '';
  const phoneInput = document.getElementById('prof-phone');
  if (phoneInput) phoneInput.value = p.phone || '';
  const locationInput = document.getElementById('prof-location');
  if (locationInput) locationInput.value = p.location || '';
  const linkedinInput = document.getElementById('prof-linkedin');
  if (linkedinInput) linkedinInput.value = p.linkedin || '';
  
  // Clear any existing inline errors
  ['name', 'subtitle', 'email', 'phone', 'location', 'linkedin'].forEach(field => {
    const errSpan = document.getElementById(`error-prof-${field}`);
    if (errSpan) {
      errSpan.textContent = '';
      errSpan.style.display = 'none';
    }
  });

  // Render education
  const eduContainer = document.getElementById('education-fields-container');
  if (eduContainer) {
    eduContainer.innerHTML = (p.education || []).filter(e => e && typeof e === 'object').map((e, index) => `
      <div class="edu-item-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
          <span style="font-size:10px; color:var(--app-ink-muted); font-weight:700;">EDUCATION #${index+1}</span>
          <button class="btn-remove" onclick="removeEducationRow(${index})">✕ Remove</button>
        </div>
        <div class="form-grid-mini">
          <input type="text" placeholder="Degree / Program" value="${escHtml(e.degree || '')}" oninput="updateEduField(${index}, 'degree', this.value)" aria-label="Education Degree ${index+1}">
          <input type="text" placeholder="School / University" value="${escHtml(e.school || '')}" oninput="updateEduField(${index}, 'school', this.value)" aria-label="Education School ${index+1}">
          <input type="text" placeholder="Dates (e.g. 06/2021 – 05/2023)" value="${escHtml(e.dates || '')}" oninput="updateEduField(${index}, 'dates', this.value)" aria-label="Education Dates ${index+1}">
          <input type="text" placeholder="Location (e.g. Houston, TX)" value="${escHtml(e.location || '')}" oninput="updateEduField(${index}, 'location', this.value)" aria-label="Education Location ${index+1}">
        </div>
      </div>
    `).join('');
  }

  // Render certs
  const certsContainer = document.getElementById('certs-fields-container');
  if (certsContainer) {
    certsContainer.innerHTML = (p.certs || []).filter(c => c !== null && c !== undefined).map((c, index) => `
      <div class="cert-item-row" style="display:flex; gap:8px; margin-bottom:6px;">
        <input type="text" placeholder="Certification Name" value="${escHtml(c || '')}" oninput="updateCertField(${index}, this.value)" class="cert-input" style="flex:1;" aria-label="Certification Name ${index+1}">
        <button class="btn-remove-icon" onclick="removeCertRow(${index})">✕</button>
      </div>
    `).join('');
  }
}

function triggerImport() {
  document.getElementById('import-file-input').click();
}

function sanitizeString(val) {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>/g, '');
}

async function importProfiles(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async function(e) {
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
      
      const confirmResult = await customConfirm(
        "Import Profiles",
        `Found ${validCount} profiles in backup: ${keys.join(', ')}.\nDo you want to merge them into your current profiles? (Profiles with the same label will be overwritten)`
      );
      
      if (confirmResult) {
        keys.forEach(k => {
          const item = importedData[k];
          if (item && typeof item === 'object' && item.profile && typeof item.profile === 'object') {
            const cleanLabel = k.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
            if (!cleanLabel) return;
            
            profiles[cleanLabel] = {
              profile: {
                name: sanitizeString(item.profile.name),
                subtitle: sanitizeString(item.profile.subtitle),
                email: sanitizeString(item.profile.email),
                phone: sanitizeString(item.profile.phone),
                location: sanitizeString(item.profile.location),
                linkedin: sanitizeString(item.profile.linkedin),
                education: Array.isArray(item.profile.education) ? item.profile.education.filter(e => e && typeof e === 'object').map(e => ({
                  degree: sanitizeString(e.degree),
                  school: sanitizeString(e.school),
                  dates: sanitizeString(e.dates),
                  location: sanitizeString(e.location)
                })) : [],
                certs: Array.isArray(item.profile.certs) ? item.profile.certs.filter(c => c !== null && c !== undefined).map(c => sanitizeString(c)) : []
              },
              text: typeof item.text === 'string' ? item.text : ''
            };
          }
        });
        
        upgradeAllProfiles();
        
        currentProfileId = keys[0].trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
        localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
        saveToStorageImmediate();
        updateProfileSelectDropdown();
        document.getElementById('resume-text').value = profiles[currentProfileId].text || '';
        renderFormFields();
        detectSectionsAndCompanies();
        updatePreviewImmediate();
        
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
  const summaryRx   = /(?:^|\n)\s*\[?(?:SUMMARY|PROFESSIONAL SUMMARY)\]?:?\s*([\s\S]*?)(?=(?:\n\s*\[?(?:SKILLS|TECHNICAL SKILLS|EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS)\]?:?)|$)/i;
  const skillsRx    = /(?:^|\n)\s*\[?(?:SKILLS|TECHNICAL SKILLS)\]?:?\s*([\s\S]*?)(?=(?:\n\s*\[?(?:SUMMARY|PROFESSIONAL SUMMARY|EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS)\]?:?)|$)/i;
  const experienceRx= /(?:^|\n)\s*\[?(?:EXPERIENCE|PROFESSIONAL EXPERIENCE)\]?:?\s*([\s\S]*?)(?=(?:\n\s*\[?(?:SUMMARY|PROFESSIONAL SUMMARY|SKILLS|TECHNICAL SKILLS|EDUCATION|CERTIFICATIONS)\]?:?)|$)/i;
  const get = (rx) => { const m = raw.match(rx); return m ? m[1].trim() : ''; };
  return { summary: get(summaryRx), skills: get(skillsRx), experience: get(experienceRx) };
}


// ── PREVIEW BUILDER ──

// ── SCALE PREVIEW TO FIT VIEWPORT OR USER ZOOM ──
let lastPaneWidth = 0;
let lastMockupWidth = 0;
let lastMockupHeight = 0;
let isScaling = false;
let currentZoomScale = 'auto';

function setZoomScale(scale) {
  currentZoomScale = scale;
  
  const pane = document.querySelector('.preview-pane');
  if (pane) {
    if (scale === 'scroll') {
      pane.classList.add('scrollable-mode');
    } else {
      pane.classList.remove('scrollable-mode');
    }
  }
  
  // Update zoom active buttons styling
  const buttons = document.querySelectorAll('.btn-zoom');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (scale === 'auto' && btn.id === 'btn-zoom-auto') {
      btn.classList.add('active');
    } else if (scale === 'scroll' && btn.id === 'btn-zoom-scroll') {
      btn.classList.add('active');
    } else if (scale === 0.75 && btn.id === 'btn-zoom-75') {
      btn.classList.add('active');
    } else if (scale === 1.0 && btn.id === 'btn-zoom-100') {
      btn.classList.add('active');
    } else if (scale === 1.25 && btn.id === 'btn-zoom-125') {
      btn.classList.add('active');
    }
  });
  
  adjustPreviewScale();
}

function adjustPreviewScale() {
  if (isScaling) return;
  if (currentZoomScale === 'scroll') {
    const mockup = document.getElementById('resume-mockup');
    if (mockup) {
      mockup.style.transform = 'none';
      mockup.style.transformOrigin = 'initial';
      mockup.style.marginBottom = '0';
    }
    return;
  }
  
  const pane = document.querySelector('.preview-pane');
  const mockup = document.getElementById('resume-mockup');
  if (!pane || !mockup) return;
  
  const paneWidth = pane.clientWidth - 32;
  const mockupWidth = mockup.offsetWidth;
  const mockupHeight = mockup.offsetHeight;
  
  isScaling = true;
  
  if (paneWidth <= 0 || mockupWidth <= 0) {
    isScaling = false;
    return;
  }
  
  lastPaneWidth = paneWidth;
  lastMockupWidth = mockupWidth;
  lastMockupHeight = mockupHeight;
  
  let scale = 1.0;
  if (currentZoomScale === 'auto') {
    if (paneWidth < mockupWidth) {
      scale = paneWidth / mockupWidth;
    }
  } else {
    scale = currentZoomScale;
  }
  
  if (scale < 1.0 || (currentZoomScale !== 'auto' && scale !== 1.0)) {
    const heightReduction = mockupHeight * (1 - scale);
    mockup.style.transform = `scale(${scale})`;
    mockup.style.transformOrigin = 'top center';
    mockup.style.marginBottom = `-${heightReduction}px`;
  } else {
    mockup.style.transform = 'none';
    mockup.style.transformOrigin = 'initial';
    mockup.style.marginBottom = '0';
  }
  
  requestAnimationFrame(() => {
    isScaling = false;
  });
}

let cachedWidth = window.innerWidth;
window.addEventListener('resize', () => {
  const currentWidth = window.innerWidth;
  if (Math.abs(currentWidth - cachedWidth) < 12) {
    return;
  }
  cachedWidth = currentWidth;
  adjustPreviewScale();
});

// ── PREVIEW BUILDER ──
function updatePreviewRaw() {
  const raw = document.getElementById('resume-text').value.trim();
  const mockup = document.getElementById('resume-mockup');
  const p = profiles[currentProfileId]?.profile || {};

  if (!raw && !p.name) {
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
  if (p.location) contactParts.push(escHtml(p.location));
  if (p.phone) contactParts.push(escHtml(p.phone));
  if (p.email) contactParts.push(`<a href="mailto:${escHtml(p.email)}">${escHtml(p.email)}</a>`);
  if (p.linkedin) {
    let rawUrl = p.linkedin.trim();
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
      <div class="mock-name">${escHtml(p.name || '')}</div>
      <div class="mock-subtitle">${escHtml(p.subtitle || '')}</div>
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
  (p.education || []).forEach(e => {
    elements.push(createEl(`
      <div class="mock-edu-row">
        <span>${escHtml(e.degree || '')}</span>
        <span>${escHtml(e.dates || '')}</span>
      </div>
    `));
    elements.push(createEl(`<div class="mock-edu-school">${escHtml(e.school || '')}${e.location ? ', ' + escHtml(e.location) : ''}</div>`));
  });

  // 6. Certifications
  if (p.certs && p.certs.length) {
    elements.push(createEl(`<div class="mock-section-head">CERTIFICATIONS:</div>`));
    p.certs.forEach(c => {
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
}

let updatePreviewTimeout = null;

function updatePreview() {
  clearTimeout(updatePreviewTimeout);
  updatePreviewTimeout = setTimeout(() => {
    updatePreviewRaw();
  }, 150);
}

function updatePreviewImmediate() {
  clearTimeout(updatePreviewTimeout);
  updatePreviewRaw();
}



function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#x27;')
            .replace(/\//g,'&#x2F;');
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
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 6px; display: inline-block; vertical-align: middle;" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
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
function handleMobileFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    document.getElementById('resume-text').value = evt.target.result;
    detectSectionsAndCompanies();
    updatePreviewImmediate();
    showToast("Imported resume text file");
  };
  reader.readAsText(file);
  event.target.value = '';
}

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

    const hintWrapper = document.querySelector('.drop-hint-wrapper');
    if (hintWrapper) {
      hintWrapper.addEventListener('click', (e) => {
        if (e.target.id === 'paste-btn' || e.target.closest('#paste-btn')) {
          return;
        }
        const fileInput = document.getElementById('mobile-text-import');
        if (fileInput) fileInput.click();
      });
    }
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
  const P = profiles[currentProfileId]?.profile || {};

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
    if (navEdit) {
      navEdit.classList.remove('active');
      navEdit.setAttribute('aria-pressed', 'false');
    }
    if (navPreview) {
      navPreview.classList.add('active');
      navPreview.setAttribute('aria-pressed', 'true');
    }
    if (typeof updatePreview === 'function') {
      updatePreview();
    }
    if (typeof adjustPreviewScale === 'function') {
      setTimeout(adjustPreviewScale, 50);
    }
  } else {
    body.classList.remove('show-preview');
    if (navEdit) {
      navEdit.classList.add('active');
      navEdit.setAttribute('aria-pressed', 'true');
    }
    if (navPreview) {
      navPreview.classList.remove('active');
      navPreview.setAttribute('aria-pressed', 'false');
    }
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
  const p = profiles[currentProfileId]?.profile || {};
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
// ── API-BASED LLM ATS SCORING ENGINE ──
async function analyzeATSScore() {
  const resumeText = document.getElementById('resume-text').value;
  const jdText = document.getElementById('jd-text') ? document.getElementById('jd-text').value.trim() : "";
  
  if (!resumeText || !resumeText.trim()) {
    showToast("Please enter some resume experience text first.");
    return;
  }
  if (!jdText || !jdText.trim()) {
    showToast("Job description is empty. Analyzing general resume quality and formatting instead.");
  }

  const loadingOverlay = document.getElementById('scoring-loading');
  if (loadingOverlay) loadingOverlay.style.display = 'flex';

  try {
    const response = await fetch('/api/ats-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ resumeText, jobDescription: jdText })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to analyze resume.');
    }

    const data = await response.json();
    if (profiles[currentProfileId]) {
      profiles[currentProfileId].ats_results = data;
      saveToStorage();
    }
    renderScoringUI(data);
    // Persist analysis results so they survive page refresh
    localStorage.setItem('resume_builder_ats_results', JSON.stringify(data));
    showToast("Resume analysis completed successfully!");
  } catch (err) {
    console.error(err);
    showToast("Analysis Error: " + err.message);
  } finally {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }
}

function getScoreColor(val) {
  if (val >= 80) return '#22c55e';
  if (val >= 60) return '#eab308';
  return '#ef4444';
}

function clearScoringUI() {
  const emptyState = document.getElementById('score-empty-state');
  if (emptyState) emptyState.style.display = 'flex';

  const detailsContainer = document.getElementById('score-details-container');
  if (detailsContainer) detailsContainer.style.display = 'none';
}

function renderScoringUI(data) {
  // Hide empty state and show results details container
  const emptyState = document.getElementById('score-empty-state');
  if (emptyState) emptyState.style.display = 'none';

  const detailsContainer = document.getElementById('score-details-container');
  if (detailsContainer) detailsContainer.style.display = 'block';

  // ── Score Delta (before/after) ──
  if (!profiles[currentProfileId]) {
    profiles[currentProfileId] = {};
  }
  const prevScores = profiles[currentProfileId].last_scores || null;
  profiles[currentProfileId].last_scores = {
    overall: data.overall, ats: data.ats, recruiter: data.recruiter, technical: data.technical
  };
  saveToStorageImmediate();

  function deltaStr(cur, prev) {
    if (prev === null || prev === undefined) return '';
    const diff = cur - prev;
    if (diff === 0) return '';
    return diff > 0 ? ` <span class="score-delta up">↑${diff}</span>` : ` <span class="score-delta down">↓${Math.abs(diff)}</span>`;
  }

  // Update Overall Badge & Pct Text
  document.getElementById('overall-score-badge').innerHTML = `${data.overall}/100${prevScores ? deltaStr(data.overall, prevScores.overall) : ''}`;
  document.getElementById('overall-score-pct').textContent = `${data.overall}%`;
  
  // Radial Ring Fill
  const ringFill = document.getElementById('overall-radial-fill');
  if (ringFill) {
    ringFill.setAttribute('stroke-dasharray', `${data.overall}, 100`);
    ringFill.style.stroke = getScoreColor(data.overall);
  }

  // Show score formula note
  const formulaNote = document.getElementById('score-formula-note');
  if (formulaNote) formulaNote.style.display = 'block';

  // Update Dimensions with color-coded bars and deltas
  document.getElementById('ats-score-val').innerHTML = `${data.ats}/100${prevScores ? deltaStr(data.ats, prevScores.ats) : ''}`;
  const atsBar = document.getElementById('ats-score-bar');
  atsBar.style.width = `${data.ats}%`;
  atsBar.style.background = getScoreColor(data.ats);
  
  document.getElementById('recruiter-score-val').innerHTML = `${data.recruiter}/100${prevScores ? deltaStr(data.recruiter, prevScores.recruiter) : ''}`;
  const recBar = document.getElementById('recruiter-score-bar');
  recBar.style.width = `${data.recruiter}%`;
  recBar.style.background = getScoreColor(data.recruiter);
  
  document.getElementById('technical-score-val').innerHTML = `${data.technical}/100${prevScores ? deltaStr(data.technical, prevScores.technical) : ''}`;
  const techBar = document.getElementById('technical-score-bar');
  techBar.style.width = `${data.technical}%`;
  techBar.style.background = getScoreColor(data.technical);

  // Update Keyword Feedback Tags
  const kwFeedback = document.getElementById('keyword-feedback');
  if (kwFeedback) {
    const total = data.criticalMatched.length + data.criticalMissing.length + data.importantMatched.length + data.importantMissing.length + data.preferredMatched.length + data.preferredMissing.length;
    if (total === 0) {
      kwFeedback.style.display = 'none';
    } else {
      kwFeedback.style.display = 'block';
    }
    const matched = data.criticalMatched.length + data.importantMatched.length + data.preferredMatched.length;
    const rate = total > 0 ? Math.round((matched / total) * 100) : 0;
    
    document.getElementById('keyword-match-rate').textContent = `${rate}%`;
    document.getElementById('keyword-match-count').textContent = `${matched} of ${total} keywords`;

    // Show ATS gap note when match rate and ATS score differ significantly
    const atsGapNote = document.getElementById('ats-gap-note');
    if (atsGapNote && Math.abs(rate - data.ats) > 5) {
      atsGapNote.style.display = 'block';
    }

    const matchedContainer = document.getElementById('matched-kw-tags');
    matchedContainer.innerHTML = [
      ...data.criticalMatched.map(k => `<span class="kw-tag match critical" title="Critical Requirement">${escHtml(k)} (C)</span>`),
      ...data.importantMatched.map(k => `<span class="kw-tag match important" title="Important Requirement">${escHtml(k)} (I)</span>`),
      ...data.preferredMatched.map(k => `<span class="kw-tag match preferred" title="Preferred Requirement">${escHtml(k)} (P)</span>`)
    ].join('');

    const missingContainer = document.getElementById('missing-kw-tags');
    missingContainer.innerHTML = [
      ...data.criticalMissing.map(k => `<span class="kw-tag missing critical" title="Critical Requirement">${escHtml(k)} (C)</span>`),
      ...data.importantMissing.map(k => `<span class="kw-tag missing important" title="Important Requirement">${escHtml(k)} (I)</span>`),
      ...data.preferredMissing.map(k => `<span class="kw-tag missing preferred" title="Preferred Requirement">${escHtml(k)} (P)</span>`)
    ].join('');
  }

  // Update Suggestions Checklist
  const listContainer = document.getElementById('suggestions-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    
    let matchClass = "match-level-weak";
    if (data.overall >= 85) matchClass = "match-level-excellent";
    else if (data.overall >= 70) matchClass = "match-level-strong";
    else if (data.overall >= 50) matchClass = "match-level-moderate";

    let html = '';
    html += `<div class="match-level-badge ${matchClass}">Match Level: ${data.matchLevel}</div>`;

    // Strengths
    html += `
      <div class="suggestion-group">
        <div class="group-title strengths">Strengths (${data.strengths.length})</div>
        <ul class="suggestions-list">
          ${data.strengths.length > 0 ? data.strengths.map(s => `
            <li class="suggestion-pass">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="flex-shrink:0; margin-top:2px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <span>${escHtml(s)}</span>
            </li>
          `).join('') : '<li class="empty-suggestions">No key strengths identified yet.</li>'}
        </ul>
      </div>
    `;

    // Weaknesses
    html += `
      <div class="suggestion-group" style="margin-top: 14px;">
        <div class="group-title weaknesses">Weaknesses & Actionable Improvements (${data.weaknesses.length})</div>
        <ul class="suggestions-list">
          ${data.weaknesses.length > 0 ? data.weaknesses.map(w => {
            const text = typeof w === 'object' ? w.text : w;
            const severity = typeof w === 'object' ? (w.severity || 'medium') : 'medium';
            const sevLabel = severity === 'critical' ? 'CRITICAL' : severity === 'low' ? 'LOW' : 'MEDIUM';
            return `
            <li class="suggestion-fail severity-${severity}">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="flex-shrink:0; margin-top:2px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span class="severity-badge sev-${severity}">${sevLabel}</span>
              <span>${escHtml(text)}</span>
            </li>
          `}).join('') : '<li class="suggestion-pass" style="justify-content:center; width:100%; font-weight:600;">✓ Excellent! Your resume conforms to all guidelines.</li>'}
        </ul>
      </div>
    `;
    listContainer.innerHTML = html;
  }
}

// Populate company copy buttons and preview on load
window.addEventListener('DOMContentLoaded', () => {
  initProfiles();

  // Load saved Job Description if it exists in localStorage
  const jdTextarea = document.getElementById('jd-text');
  if (jdTextarea) {
    const savedJD = localStorage.getItem('resume_builder_saved_jd');
    if (savedJD) {
      jdTextarea.value = savedJD;
    }
    // Save Job Description to localStorage on input + word count
    function updateJDWordCount() {
      const words = jdTextarea.value.trim() ? jdTextarea.value.trim().split(/\s+/).length : 0;
      const wcEl = document.getElementById('jd-word-count');
      if (wcEl) wcEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    }
    updateJDWordCount();
    jdTextarea.addEventListener('input', () => {
      localStorage.setItem('resume_builder_saved_jd', jdTextarea.value);
      updateJDWordCount();
    });
  }

  // Bind the analyze button
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeATSScore);
  }

  // Restore previous analysis results on page load
  if (profiles[currentProfileId] && profiles[currentProfileId].ats_results) {
    // Loaded by initProfiles
  } else {
    const savedResults = localStorage.getItem('resume_builder_ats_results');
    if (savedResults) {
      try {
        const data = JSON.parse(savedResults);
        if (profiles[currentProfileId]) {
          profiles[currentProfileId].ats_results = data;
          saveToStorage();
        }
        renderScoringUI(data);
      } catch (e) {
        console.warn('Could not restore saved ATS results:', e);
      }
    }
  }
});