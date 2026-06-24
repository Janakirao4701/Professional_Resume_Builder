// ── RESUME BUILDER MAIN ENTRYPOINT ──

import { 
  profiles, 
  currentProfileId, 
  activeProfile, 
  initProfiles, 
  setCurrentProfileId, 
  setProfiles, 
  upgradeAllProfiles, 
  saveToStorage, 
  saveToStorageImmediate,
  DEFAULT_PROFILE_DATA,
  GUIDED_ONBOARDING_TEMPLATE
} from './js/state.js';

import { 
  parseContent, 
  parseCompanies 
} from './js/parser.js';

import { 
  updatePreview, 
  updatePreviewImmediate, 
  updatePreviewRaw, 
  setZoomScale, 
  adjustPreviewScale 
} from './js/preview.js';

import { 
  escHtml, 
  showToast, 
  customConfirm, 
  customPrompt, 
  recordStateChange, 
  undoEdit, 
  redoEdit, 
  toggleTheme, 
  initTheme, 
  toggleShortcutsModal 
} from './js/ui.js';

import { downloadDocx } from './js/docx.js';
import { downloadPdf } from './js/pdf.js';

import { 
  analyzeATSScore, 
  clearScoringUI, 
  renderScoringUI, 
  updateKeywordTagsUI, 
  scanKeywordsRealtime 
} from './js/ats.js';

import { 
  PROMPT_TEMPLATES, 
  loadSelectedPrompt, 
  updateCombinedPromptPreview, 
  generateCombinedPrompt, 
  copyAIPrompt 
} from './js/prompts.js';

// ── GLOBAL REGISTRATION FOR INLINE HTML HANDLERS ──
window.switchProfile = switchProfile;
window.createNewProfile = createNewProfile;
window.duplicateCurrentProfile = duplicateCurrentProfile;
window.renameCurrentProfile = renameCurrentProfile;
window.deleteCurrentProfileConfirm = deleteCurrentProfileConfirm;
window.toggleHdrDropdown = toggleHdrDropdown;
window.closeHdrDropdown = closeHdrDropdown;
window.toggleDetailsForm = toggleDetailsForm;
window.updateProfileField = updateProfileField;
window.updateEduField = updateEduField;
window.updateCertField = updateCertField;
window.addEducationRow = addEducationRow;
window.removeEducationRow = removeEducationRow;
window.addCertRow = addCertRow;
window.removeCertRow = removeCertRow;
window.triggerImport = triggerImport;
window.importProfiles = importProfiles;
window.exportProfiles = exportProfiles;
window.pasteFromClipboard = pasteFromClipboard;
window.copyCompanyExp = copyCompanyExp;
window.setMobileView = setMobileView;
window.toggleMobileMenu = toggleMobileMenu;
window.triggerMobilePDF = triggerMobilePDF;
window.triggerMobileDOCX = triggerMobileDOCX;
window.triggerMobileImport = triggerMobileImport;
window.triggerMobileExport = triggerMobileExport;
window.toggleAIAssistant = toggleAIAssistant;
window.loadSelectedPrompt = loadSelectedPrompt;
window.copyAIPrompt = copyAIPrompt;
window.toggleJDPane = toggleJDPane;
window.setZoomScale = setZoomScale;
window.undoEdit = undoEdit;
window.redoEdit = redoEdit;
window.toggleTheme = toggleTheme;

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

// Global keyboard listeners
window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    trapFocusInDrawer(e);
  } else if (e.key === 'Escape') {
    const drawer = document.getElementById('profile-drawer');
    if (drawer && drawer.classList.contains('active')) {
      toggleDetailsForm();
    }
    const mobileMenu = document.getElementById('mobile-menu-drawer');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      toggleMobileMenu(false);
    }
    toggleShortcutsModal(false);
  } else if (e.ctrlKey && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undoEdit();
  } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    redoEdit();
  } else if (e.ctrlKey && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    downloadPdf();
  } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    downloadDocx();
  } else if (e.ctrlKey && e.key.toLowerCase() === 'n') {
    e.preventDefault();
    createNewProfile();
  } else if (e.ctrlKey && e.key === '/') {
    e.preventDefault();
    toggleShortcutsModal();
  } else if (e.key === '?' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    toggleShortcutsModal();
  }
});

function updateProfileSelectDropdown() {
  const select = document.getElementById('profile-select');
  const optionsHtml = Object.keys(profiles).map(id => {
    return `<option value="${escHtml(id)}" ${id === currentProfileId ? 'selected' : ''}>${escHtml(id)}</option>`;
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
  const textareaVal = document.getElementById('resume-text').value;
  activeProfile.text = textareaVal;
  
  setCurrentProfileId(profileId);
  
  const select = document.getElementById('profile-select');
  if (select) select.value = currentProfileId;
  const mobileSelect = document.getElementById('mobile-profile-select');
  if (mobileSelect) mobileSelect.value = currentProfileId;
  
  document.getElementById('resume-text').value = activeProfile.text;
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreviewImmediate();

  if (activeProfile.ats_results) {
    renderScoringUI(activeProfile.ats_results);
  } else {
    clearScoringUI();
  }
  
  recordStateChange(activeProfile.text);
}

async function createNewProfile() {
  const name = await customPrompt("Enter a label/identifier for the new profile (e.g. 'Software_Engineer'):");
  if (!name) return;
  const cleanLabel = name.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
  if (!cleanLabel) { showToast("Invalid profile label. Use letters, numbers, underscores, or hyphens."); return; }
  if (profiles[cleanLabel]) { showToast("A profile with that label already exists."); return; }
  
  const newProfiles = { ...profiles };
  newProfiles[cleanLabel] = {
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
    text: GUIDED_ONBOARDING_TEMPLATE // Populate new profile with guided template
  };
  
  setProfiles(newProfiles);
  setCurrentProfileId(cleanLabel);
  updateProfileSelectDropdown();
  
  document.getElementById('resume-text').value = activeProfile.text;
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreviewImmediate();
  clearScoringUI();
  showToast("Created guided profile: " + cleanLabel);
  
  recordStateChange(activeProfile.text);

  const drawer = document.getElementById('profile-drawer');
  if (drawer && !drawer.classList.contains('active')) {
    toggleDetailsForm();
  }
}

async function duplicateCurrentProfile() {
  const name = await customPrompt("Enter a label/identifier for the duplicated profile (e.g. 'Software_Engineer_Copy'):");
  if (!name) return;
  const cleanLabel = name.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
  if (!cleanLabel) { showToast("Invalid profile label. Use letters, numbers, underscores, or hyphens."); return; }
  if (profiles[cleanLabel]) { showToast("A profile with that label already exists."); return; }
  
  const textareaVal = document.getElementById('resume-text').value;
  activeProfile.text = textareaVal;
  
  const newProfiles = { ...profiles };
  newProfiles[cleanLabel] = JSON.parse(JSON.stringify(profiles[currentProfileId]));
  
  setProfiles(newProfiles);
  setCurrentProfileId(cleanLabel);
  updateProfileSelectDropdown();
  
  document.getElementById('resume-text').value = activeProfile.text;
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreviewImmediate();
  
  if (activeProfile.ats_results) {
    renderScoringUI(activeProfile.ats_results);
  } else {
    clearScoringUI();
  }
  showToast("Duplicated profile to: " + cleanLabel);
  
  recordStateChange(activeProfile.text);
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
    const newProfiles = { ...profiles };
    newProfiles[cleanLabel] = newProfiles[oldLabel];
    delete newProfiles[oldLabel];
    
    setProfiles(newProfiles);
    setCurrentProfileId(cleanLabel);
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
  const newProfiles = { ...profiles };
  delete newProfiles[targetId];
  
  setProfiles(newProfiles);
  setCurrentProfileId(Object.keys(newProfiles)[0]);
  updateProfileSelectDropdown();
  
  document.getElementById('resume-text').value = activeProfile.text;
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreviewImmediate();
  
  if (activeProfile.ats_results) {
    renderScoringUI(activeProfile.ats_results);
  } else {
    clearScoringUI();
  }
  showToast(`Deleted profile "${targetId}"`);
  
  recordStateChange(activeProfile.text);
}

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

window.addEventListener('click', () => {
  closeHdrDropdown();
});

function toggleDetailsForm() {
  const drawer = document.getElementById('profile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const btn = document.getElementById('toggle-details-btn');
  if (!drawer || !overlay || !btn) return;
  
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
  activeProfile[field] = value;
  updatePreview();
}

function updateEduField(index, field, value) {
  const education = [...(activeProfile.education || [])];
  if (!education[index]) return;
  education[index][field] = value;
  activeProfile.education = education;
  updatePreview();
}

function updateCertField(index, value) {
  const certs = [...(activeProfile.certs || [])];
  certs[index] = value;
  activeProfile.certs = certs;
  updatePreview();
}

function addEducationRow() {
  const education = [...(activeProfile.education || [])];
  education.push({ degree: '', school: '', dates: '', location: '' });
  activeProfile.education = education;
  renderFormFields();
  updatePreviewImmediate();
}

function removeEducationRow(index) {
  const education = [...(activeProfile.education || [])];
  education.splice(index, 1);
  activeProfile.education = education;
  renderFormFields();
  updatePreviewImmediate();
}

function addCertRow() {
  const certs = [...(activeProfile.certs || [])];
  certs.push('');
  activeProfile.certs = certs;
  renderFormFields();
  updatePreviewImmediate();
}

function removeCertRow(index) {
  const certs = [...(activeProfile.certs || [])];
  certs.splice(index, 1);
  activeProfile.certs = certs;
  renderFormFields();
  updatePreviewImmediate();
}

function renderFormFields() {
  const p = profiles[currentProfileId]?.profile || {};
  
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
  
  ['name', 'subtitle', 'email', 'phone', 'location', 'linkedin'].forEach(field => {
    const errSpan = document.getElementById(`error-prof-${field}`);
    if (errSpan) {
      errSpan.textContent = '';
      errSpan.style.display = 'none';
    }
  });

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
  const input = document.getElementById('import-file-input');
  if (input) input.click();
}

async function importProfiles(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid format. Expected JSON object.");
      }
      
      const keys = Object.keys(data);
      if (keys.length === 0) {
        throw new Error("No profiles found in backup.");
      }
      
      const cleanData = {};
      keys.forEach(k => {
        const cleanK = k.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
        if (cleanK) {
          cleanData[cleanK] = data[k];
        }
      });
      
      const confirmImport = await customConfirm("Import Backup", `This will merge ${Object.keys(cleanData).length} profile(s) with your existing profiles. Continue?`);
      if (!confirmImport) return;
      
      const merged = { ...profiles, ...cleanData };
      setProfiles(merged);
      upgradeAllProfiles();
      
      switchProfile(Object.keys(cleanData)[0]);
      showToast("Profiles imported successfully!");
    } catch(err) {
      console.error('[Import Error]', err);
      showToast("Import failed: " + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function exportProfiles() {
  const textareaVal = document.getElementById('resume-text').value;
  activeProfile.text = textareaVal;
  
  const activeProfileData = {
    [currentProfileId]: profiles[currentProfileId]
  };
  
  const dataStr = JSON.stringify(activeProfileData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  
  // Custom safe saveAs download helper
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentProfileId}_backup.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  
  showToast(`Exported "${currentProfileId}" backup successfully!`);
}

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
    activeProfile.text = text;
    
    detectSectionsAndCompanies();
    updatePreview();
    
    // Trigger real-time keyword updates
    scanKeywordsRealtime();

    const span = btn.querySelector('span');
    const originalText = span.textContent;
    span.textContent = '✓ Pasted!';
    btn.classList.add('pasted');
    setTimeout(() => {
      span.textContent = originalText;
      btn.classList.remove('pasted');
    }, 2000);
    
    recordStateChange(text);
  } catch (err) {
    showToast('Clipboard access blocked. Please paste manually using Ctrl+V.');
    const textarea = document.getElementById('resume-text');
    const dropArea = document.querySelector('.drop-area');
    if (textarea) textarea.focus();
    if (dropArea) {
      dropArea.classList.add('flash-focus');
      setTimeout(() => dropArea.classList.remove('flash-focus'), 1600);
    }
  }
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

function detectSectionsAndCompanies() {
  const raw = document.getElementById('resume-text').value;
  parseCompanies(raw);
}

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
    updatePreview();
    setTimeout(adjustPreviewScale, 50);
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
  downloadPdf();
}

function triggerMobileDOCX() {
  toggleMobileMenu(false);
  downloadDocx();
}

function triggerMobileImport() {
  toggleMobileMenu(false);
  triggerImport();
}

function triggerMobileExport() {
  toggleMobileMenu(false);
  exportProfiles();
}

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

function toggleJDPane() {
  const pane = document.getElementById('jd-content');
  const btn = document.getElementById('jd-toggle-btn');
  if (pane && btn) {
    const isExpanded = pane.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  }
}

// ── DOM CONTENT LOADED EVENT HANDLER ──
window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme
  initTheme();

  // 2. Initialize profiles state
  initProfiles();

  // 3. Set initial textarea content
  const textarea = document.getElementById('resume-text');
  if (textarea) {
    textarea.value = activeProfile.text;
  }
  
  // 4. Update dropdown selections
  updateProfileSelectDropdown();
  renderFormFields();
  detectSectionsAndCompanies();
  updatePreviewImmediate();

  // 5. Render ATS results if stored
  if (activeProfile.ats_results) {
    renderScoringUI(activeProfile.ats_results);
  } else {
    const savedResults = localStorage.getItem('resume_builder_ats_results');
    if (savedResults) {
      try {
        const data = JSON.parse(savedResults);
        activeProfile.ats_results = data;
        saveToStorage();
        renderScoringUI(data);
      } catch (e) {
        console.warn('Could not restore saved ATS results:', e);
      }
    } else {
      clearScoringUI();
    }
  }
  
  // Record first state for undo history
  recordStateChange(activeProfile.text);

  // 6. Bind Job Description events
  const jdTextarea = document.getElementById('jd-text');
  if (jdTextarea) {
    const savedJD = localStorage.getItem('resume_builder_saved_jd');
    if (savedJD) {
      jdTextarea.value = savedJD;
    }
    
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

  // 7. Bind PDF / DOCX download click handlers
  const pdfBtn = document.getElementById('pdf-btn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', downloadPdf);
  }
  const dlBtn = document.getElementById('dl-btn');
  if (dlBtn) {
    dlBtn.addEventListener('click', downloadDocx);
  }

  // 8. Bind ATS Score analyze button
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeATSScore);
  }

  // 9. Textarea key inputs
  if (textarea) {
    textarea.oninput = function() {
      const original = this.value;
      const sanitized = original.replace(/^(\d+\.)(?!\d)\s*/gm, '- ');
      if (original !== sanitized) {
        const cursor = this.selectionStart;
        this.value = sanitized;
        if (cursor !== null) this.setSelectionRange(cursor, cursor);
      }
      
      activeProfile.text = this.value;
      
      // Live scan keywords on text changes
      scanKeywordsRealtime();
      
      detectSectionsAndCompanies();
      updatePreview();
      recordStateChange(this.value);
    };
  }

  // 10. Drag and drop features
  const dropArea = document.querySelector('.drop-area');
  if (dropArea) {
    dropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'var(--app-accent)';
      dropArea.style.background = 'var(--app-accent-glow)';
    });
    
    dropArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'var(--app-border)';
      dropArea.style.background = 'var(--app-surface)';
    });
    
    dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'var(--app-border)';
      dropArea.style.background = 'var(--app-surface)';
      
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          if (textarea) {
            textarea.value = evt.target.result;
            activeProfile.text = evt.target.result;
            detectSectionsAndCompanies();
            updatePreviewImmediate();
            scanKeywordsRealtime();
            showToast("Imported resume text file");
            recordStateChange(evt.target.result);
          }
        };
        reader.readAsText(file);
      }
    });

    const hintWrapper = document.querySelector('.drop-hint-wrapper');
    if (hintWrapper) {
      hintWrapper.addEventListener('click', (e) => {
        if (e.target.id === 'paste-btn' || e.target.closest('#paste-btn') || 
            e.target.id === 'undo-btn' || e.target.closest('#undo-btn') || 
            e.target.id === 'redo-btn' || e.target.closest('#redo-btn')) {
          return;
        }
        const fileInput = document.getElementById('mobile-text-import');
        if (fileInput) fileInput.click();
      });
    }
  }
  
  // 11. Offline clipboard paste
  document.addEventListener('paste', (e) => {
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    if (!pastedText) return;

    const activeEl = document.activeElement;
    if (activeEl !== textarea && activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const sanitized = pastedText.replace(/^(\d+\.)(?!\d)\s*/gm, '- ');
      if (textarea) {
        textarea.value = sanitized;
        activeProfile.text = sanitized;
        detectSectionsAndCompanies();
        updatePreviewImmediate();
        scanKeywordsRealtime();
        showToast('Pasted resume content successfully!');
        recordStateChange(sanitized);
      }
    }
  });
});

// ── PWA SERVICE WORKER REGISTRATION ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch(err => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}