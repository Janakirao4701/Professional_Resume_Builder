let PROFILES = {};
let DEFAULT_TEXTS = {};

let activeCandidate = null;
let editingKey = null;

function getActiveProfile() {
  return activeCandidate ? PROFILES[activeCandidate] : null;
}

// ── LOCAL STORAGE OPERATIONS ──
function loadCustomProfiles() {
  try {
    const data = localStorage.getItem('custom_resume_profiles');
    if (data) {
      const parsed = JSON.parse(data);
      Object.keys(parsed).forEach(key => {
        PROFILES[key] = parsed[key].profile;
        DEFAULT_TEXTS[key] = parsed[key].text;
      });
    }
  } catch (e) {
    console.error("Failed to load custom profiles", e);
  }
}

function saveCustomProfiles() {
  try {
    const custom = {};
    Object.keys(PROFILES).forEach(key => {
      custom[key] = {
        profile: PROFILES[key],
        text: DEFAULT_TEXTS[key]
      };
    });
    localStorage.setItem('custom_resume_profiles', JSON.stringify(custom));
  } catch (e) {
    console.error("Failed to save custom profiles", e);
  }
}

// ── SWITCH CANDIDATE ──
function switchCandidate(key) {
  const deleteBtn = document.getElementById('delete-profile-btn');
  const editBtn = document.getElementById('edit-profile-btn');
  const textarea = document.getElementById('resume-text');

  if (!key || !PROFILES[key]) {
    activeCandidate = null;
    if (document.getElementById('candidate-select')) {
      document.getElementById('candidate-select').value = '';
    }
    if (textarea) textarea.value = '';
    if (deleteBtn) deleteBtn.style.display = 'none';
    if (editBtn) editBtn.style.display = 'none';
    
    detectSectionsAndCompanies();
    updatePreview();
    return;
  }
  
  activeCandidate = key;
  document.getElementById('candidate-select').value = key;
  document.getElementById('resume-text').value = (DEFAULT_TEXTS[key] || '').trim();
  
  if (deleteBtn) {
    deleteBtn.style.display = 'flex';
  }
  if (editBtn) {
    editBtn.style.display = 'flex';
  }

  detectSectionsAndCompanies();
  updatePreview();
}

// ── REPOPULATE SELECT OPTIONS ──
function repopulateSelector() {
  const select = document.getElementById('candidate-select');
  if (!select) return;
  
  select.innerHTML = '';
  const keys = Object.keys(PROFILES);
  if (keys.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No Profiles Available';
    select.appendChild(option);
    return;
  }
  
  keys.forEach(key => {
    const p = PROFILES[key];
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${p.name} (${p.subtitle || 'Candidate'})`;
    select.appendChild(option);
  });
  
  if (activeCandidate && PROFILES[activeCandidate]) {
    select.value = activeCandidate;
  } else {
    select.value = '';
  }
}

// ── MODAL DIALOG HANDLERS ──
function openProfileModal() {
  editingKey = null;
  const modalTitle = document.getElementById('modal-title');
  const submitBtn = document.getElementById('modal-submit-btn');
  if (modalTitle) modalTitle.textContent = "Create New Candidate Profile";
  if (submitBtn) submitBtn.textContent = "Save Profile";
  
  document.getElementById('profile-form').reset();
  document.getElementById('profile-modal').classList.add('active');
}

function openEditProfileModal() {
  if (!activeCandidate || !PROFILES[activeCandidate]) {
    alert("No active profile to edit.");
    return;
  }
  
  editingKey = activeCandidate;
  const modalTitle = document.getElementById('modal-title');
  const submitBtn = document.getElementById('modal-submit-btn');
  if (modalTitle) modalTitle.textContent = "Edit Candidate Profile";
  if (submitBtn) submitBtn.textContent = "Update Profile";
  
  const p = PROFILES[editingKey];
  document.getElementById('prof-name').value = p.name || '';
  document.getElementById('prof-subtitle').value = p.subtitle || '';
  document.getElementById('prof-email').value = p.email || '';
  document.getElementById('prof-phone').value = p.phone || '';
  document.getElementById('prof-location').value = p.location || '';
  document.getElementById('prof-linkedin').value = p.linkedin || '';
  
  const edu1 = p.education && p.education[0] ? p.education[0] : {};
  document.getElementById('prof-edu1-degree').value = edu1.degree || '';
  document.getElementById('prof-edu1-dates').value = edu1.dates || '';
  document.getElementById('prof-edu1-school').value = edu1.school || '';
  document.getElementById('prof-edu1-location').value = edu1.location || '';
  
  const edu2 = p.education && p.education[1] ? p.education[1] : {};
  document.getElementById('prof-edu2-degree').value = edu2.degree || '';
  document.getElementById('prof-edu2-dates').value = edu2.dates || '';
  document.getElementById('prof-edu2-school').value = edu2.school || '';
  document.getElementById('prof-edu2-location').value = edu2.location || '';
  
  document.getElementById('prof-certs').value = (p.certs || []).join(', ');
  document.getElementById('prof-resume-text').value = DEFAULT_TEXTS[editingKey] || '';
  
  document.getElementById('profile-modal').classList.add('active');
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.remove('active');
}

function saveNewProfile() {
  const name = document.getElementById('prof-name').value.trim();
  const subtitle = document.getElementById('prof-subtitle').value.trim();
  const email = document.getElementById('prof-email').value.trim();
  const phone = document.getElementById('prof-phone').value.trim();
  const location = document.getElementById('prof-location').value.trim();
  const linkedin = document.getElementById('prof-linkedin').value.trim();
  
  const edu1_degree = document.getElementById('prof-edu1-degree').value.trim();
  const edu1_dates = document.getElementById('prof-edu1-dates').value.trim();
  const edu1_school = document.getElementById('prof-edu1-school').value.trim();
  const edu1_location = document.getElementById('prof-edu1-location').value.trim();
  
  const edu2_degree = document.getElementById('prof-edu2-degree').value.trim();
  const edu2_dates = document.getElementById('prof-edu2-dates').value.trim();
  const edu2_school = document.getElementById('prof-edu2-school').value.trim();
  const edu2_location = document.getElementById('prof-edu2-location').value.trim();
  
  const certsVal = document.getElementById('prof-certs').value.trim();
  const certs = certsVal ? certsVal.split(',').map(c => c.trim()) : [];
  
  let resumeText = document.getElementById('prof-resume-text').value.trim();
  
  if (!resumeText) {
    // Generate a default boilerplate based on their name & subtitle
    resumeText = `[PROFESSIONAL SUMMARY]\nExperienced ${subtitle} with a proven track record of delivering successful projects, improving system efficiency, and collaborating with cross-functional teams.\n\n[TECHNICAL SKILLS]\nPrimary Skills: Focus Area 1, Focus Area 2.\nTools & Technologies: Tool 1, Tool 2, Tool 3.\n\n[PROFESSIONAL EXPERIENCE]\nYour Company | Location | ${subtitle} | Dates\n- Accomplished key development milestone reducing latency.\n- Led systems design and verification loops.`;
  }
  
  const education = [
    { degree: edu1_degree, dates: edu1_dates, school: edu1_school, location: edu1_location }
  ];
  if (edu2_degree && edu2_school) {
    education.push({ degree: edu2_degree, dates: edu2_dates, school: edu2_school, location: edu2_location });
  }
  
  let keyToUse = editingKey;
  if (!keyToUse) {
    keyToUse = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
  }
  
  PROFILES[keyToUse] = {
    name,
    subtitle,
    email,
    phone,
    location,
    linkedin,
    education,
    certs
  };
  
  DEFAULT_TEXTS[keyToUse] = resumeText;
  
  saveCustomProfiles();
  repopulateSelector();
  switchCandidate(keyToUse);
  closeProfileModal();
}

function deleteActiveProfile() {
  if (!activeCandidate || !PROFILES[activeCandidate]) {
    alert("No active profile to delete.");
    return;
  }
  
  if (!confirm(`Are you sure you want to delete ${PROFILES[activeCandidate].name}'s profile?`)) {
    return;
  }
  
  const targetKey = activeCandidate;
  delete PROFILES[targetKey];
  delete DEFAULT_TEXTS[targetKey];
  
  saveCustomProfiles();
  
  const keys = Object.keys(PROFILES);
  repopulateSelector();
  if (keys.length > 0) {
    switchCandidate(keys[0]);
  } else {
    switchCandidate(null);
  }
}

// Active profile proxy (replaces static PROFILE references)
const PROFILE_PROXY = new Proxy({}, {
  get(target, prop) {
    const active = getActiveProfile();
    if (!active) return undefined;
    
    if (prop === 'education') return active.education || [];
    if (prop === 'certs') return active.certs || [];
    if (prop === 'linkedin') return active.linkedin || '';
    if (prop === 'location') return active.location || '';
    if (prop === 'phone') return active.phone || '';
    if (prop === 'email') return active.email || '';
    if (prop === 'name') return active.name || '';
    if (prop === 'subtitle') return active.subtitle || '';
    
    return active[prop];
  }
});

const PROFILE = PROFILE_PROXY;

// ── DEFAULT USER PROFILE ──


// ── SECTION PARSER ──
function parseContent(raw) {
  const summaryRx   = /\[(?:SUMMARY|PROFESSIONAL SUMMARY)\]([\s\S]*?)(?=\[|$)/i;
  const skillsRx    = /\[(?:SKILLS|TECHNICAL SKILLS)\]([\s\S]*?)(?=\[|$)/i;
  const experienceRx= /\[(?:EXPERIENCE|PROFESSIONAL EXPERIENCE)\]([\s\S]*?)(?=\[|$)/i;
  const get = (rx) => { const m = raw.match(rx); return m ? m[1].trim() : ''; };
  return { summary: get(summaryRx), skills: get(skillsRx), experience: get(experienceRx) };
}

function detectSections() {
  const raw = document.getElementById('resume-text').value;
  const { summary, skills, experience } = parseContent(raw);
  const chips = document.getElementById('chips');
  const tags = [
    { label: 'Summary', found: !!summary },
    { label: 'Skills',  found: !!skills  },
    { label: 'Experience', found: !!experience }
  ];
  chips.innerHTML = tags.map(t =>
    `<span class="tag-pill ${t.found ? 'found' : 'missing'}">${t.found ? '✓' : '○'} ${t.label}</span>`
  ).join('');
}

// ── PREVIEW BUILDER ──

// ── SCALE PREVIEW TO FIT VIEWPORT ──
function adjustPreviewScale() {
  const pane = document.querySelector('.preview-pane');
  const wrap = document.querySelector('.preview-wrap');
  const mockup = document.getElementById('resume-mockup');
  if (!pane || !wrap || !mockup || pane.clientWidth === 0) return;
  
  mockup.style.transform = 'none';
  mockup.style.transformOrigin = 'top center';
  mockup.style.margin = '0 auto';
  wrap.style.width = 'auto';
  wrap.style.height = 'auto';
  
  const style = window.getComputedStyle(pane);
  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const paneWidth = pane.clientWidth - paddingLeft - paddingRight;
  const mockupWidth = mockup.offsetWidth;
  const mockupHeight = mockup.offsetHeight;
  
  if (paneWidth < mockupWidth) {
    const scale = paneWidth / mockupWidth;
    mockup.style.transform = `scale(${scale})`;
    mockup.style.transformOrigin = 'top left';
    mockup.style.margin = '0';
    
    // Resize the layout wrapper container to match the scaled mockup size
    wrap.style.width = `${mockupWidth * scale}px`;
    wrap.style.height = `${mockupHeight * scale}px`;
  } else {
    mockup.style.transform = 'none';
    mockup.style.transformOrigin = 'top center';
    mockup.style.margin = '0 auto';
    wrap.style.width = 'auto';
    wrap.style.height = 'auto';
  }
}
window.addEventListener('resize', adjustPreviewScale);

// ── PREVIEW BUILDER ──
function updatePreview() {
  const raw = document.getElementById('resume-text').value.trim();
  const mockup = document.getElementById('resume-mockup');

  if (!raw) {
    mockup.innerHTML = `<div class="empty-state"><div class="icon">📋</div><p>Paste your resume content above to see a live preview here</p></div>`;
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
  const displayLinkedin = PROFILE.linkedin.replace(/-[a-zA-Z0-9]*\d+[a-zA-Z0-9]*$/, '');
  elements.push(createEl(`
    <div style="text-align: center;">
      <div class="mock-name">${escHtml(PROFILE.name)}</div>
      <div class="mock-subtitle">${escHtml(PROFILE.subtitle)}</div>
      <div class="mock-contact">
        ${escHtml(PROFILE.location)} &nbsp;|&nbsp; 
        ${escHtml(PROFILE.phone)} &nbsp;|&nbsp; 
        <a href="mailto:${PROFILE.email}">${escHtml(PROFILE.email)}</a> &nbsp;|&nbsp; 
        <a href="https://${PROFILE.linkedin}" target="_blank">${escHtml(displayLinkedin)}</a>
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
        elements.push(createEl(`<div class="mock-bullet"><strong>${escHtml(cleanLine.substring(0, idx+1))}</strong>${escHtml(cleanLine.substring(idx+1))}</div>`));
      } else {
        elements.push(createEl(`<div class="mock-bullet">${escHtml(cleanLine)}</div>`));
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
              <span>${escHtml(parts[0])}, ${escHtml(parts[1])}</span>
              <span>${escHtml(parts[3])}</span>
            </div>
          `));
          elements.push(createEl(`<div class="mock-exp-role">${escHtml(parts[2])}</div>`));
        } else if (parts.length === 3) {
          elements.push(createEl(`
            <div class="mock-exp-header">
              <span>${escHtml(parts[0])}</span>
              <span>${escHtml(parts[2])}</span>
            </div>
          `));
          elements.push(createEl(`<div class="mock-exp-role">${escHtml(parts[1])}</div>`));
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

  setTimeout(adjustPreviewScale, 10);
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
      alert('Clipboard is empty. Copy your resume text first.');
      return;
    }
    text = text.replace(/^(\d+\.)(?!\d)\s*/gm, '- ');
    document.getElementById('resume-text').value = text;
    detectSections();
    updatePreview();
    parseCompanies(text);

    btn.innerHTML = '✓ Pasted!';
    btn.classList.add('pasted');
    setTimeout(() => {
      btn.innerHTML = '📋 Paste from Clipboard';
      btn.classList.remove('pasted');
    }, 2000);
  } catch (err) {
    // Fallback: focus textarea so user can Ctrl+V
    alert('Clipboard access denied. Please paste manually into the text area (Ctrl+V).');
    document.getElementById('resume-text').focus();
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
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.querySelector('.copy-label').textContent = 'Click to copy';
  }, 2000);
}

document.getElementById('pdf-btn').onclick = () => {
  if (!activeCandidate) {
    alert('Please select or create a candidate profile first!');
    return;
  }
  const rawText = document.getElementById('resume-text').value.trim();
  if (!rawText) {
    alert('Please paste your resume content into the text box first!');
    return;
  }
  
  // A slight delay to ensure UI updates complete before printing
  setTimeout(() => {
    window.print();
  }, 100);
};

// Also parse companies// Also parse companies when user types/pastes manually in textarea
const _origDetect = detectSections;
function detectSectionsAndCompanies() {
  _origDetect();
  const raw = document.getElementById('resume-text').value;
  parseCompanies(raw);
}
// Override oninput to also parse companies
document.getElementById('resume-text').oninput = function() {
  const original = this.value;
  const sanitized = original.replace(/^(\d+\.)(?!\d)\s*/gm, '- ');
  if (original !== sanitized) {
    const cursor = this.selectionStart;
    this.value = sanitized;
    if (cursor !== null) this.setSelectionRange(cursor, cursor);
  }
  
  if (activeCandidate) {
    DEFAULT_TEXTS[activeCandidate] = sanitized;
    saveCustomProfiles();
  }

  detectSectionsAndCompanies();
  updatePreview();
};

// ── DOCX DOWNLOAD ──

// ── NEXT SCRIPT BLOCK ──

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

// ── NEXT SCRIPT BLOCK ──

document.getElementById('dl-btn').onclick = async () => {
  if (!activeCandidate) {
    alert('Please select or create a candidate profile first.');
    return;
  }
  const raw = document.getElementById('resume-text').value.trim();
  if (!raw) { alert('Please paste your resume content first.'); return; }

  const { summary, skills, experience } = parseContent(raw);
  const btn = document.getElementById('dl-btn');
  btn.disabled = true;
  btn.innerHTML = '⏳ Generating...';

  try {
    const { Document, Packer, Paragraph, TextRun, ExternalHyperlink,
            AlignmentType, BorderStyle, LevelFormat, TabStopType } = docx;

    const P = PROFILE;

    // Headings format (uppercase text, bold, size 22 / 11pt, margin-left: 360 / 18pt, border bottom)
    function sectionHead(text) {
      return new Paragraph({
        spacing: { before: 240, after: 80 },
        
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000', space: 2 } },
        children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: 'Times New Roman', color: '000000' })]
      });
    }

    // Bullet items (size 22 / 11pt, regular, spacing before 30 after 30, indent left 720 hanging 360)
    function bullet(text) {
      return new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        spacing: { before: 30, after: 30 },
        indent: { right: 360 },
        children: [new TextRun({ text, font: 'Times New Roman', size: 22, color: '000000' })]
      });
    }

    // Skills logic
    function skillsDocx(raw) {
      if (!raw) return [];
      return raw.split('\n').filter(l => l.trim()).map(line => {
        const cleanLine = line.trim().replace(/^[-•*]\s*/, '');
        const idx = cleanLine.indexOf(':');
        if (idx > -1) {
          return new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            spacing: { before: 30, after: 30 },
            indent: { right: 360 },
            children: [
              new TextRun({ text: cleanLine.substring(0, idx+1), bold: true, font: 'Times New Roman', size: 22, color: '000000' }),
              new TextRun({ text: cleanLine.substring(idx+1), font: 'Times New Roman', size: 22, color: '000000' })
            ]
          });
        }
        return bullet(cleanLine);
      });
    }

    // Experience logic
    function expDocx(raw) {
      if (!raw) return [];
      return raw.split('\n').filter(l => l.trim()).map(line => {
        const t = line.trim();
        if (/^[-•*]/.test(t)) return bullet(t.replace(/^[-•*]\s*/, ''));
        if (t.includes('|')) {
          const parts = t.split('|').map(p => p.trim());
          const rows = [];
          if (parts.length >= 4) {
            // Company and Location with Dates (tabbed right)
            rows.push(new Paragraph({
              spacing: { before: 180, after: 40 },
              
              tabStops: [{ type: TabStopType.LEFT, position: 8640 }],
              children: [
                new TextRun({ text: `${parts[0]}, ${parts[1]}`, bold: true, font: 'Times New Roman', size: 22, color: '000000' }),
                new TextRun({ text: '\t' }),
                new TextRun({ text: parts[3], bold: true, font: 'Times New Roman', size: 22, color: '000000' })
              ]
            }));
            // Role
            rows.push(new Paragraph({
              spacing: { before: 0, after: 60 },
              
              children: [new TextRun({ text: parts[2], font: 'Times New Roman', size: 22, color: '000000' })]
            }));
          } else if (parts.length === 3) {
            rows.push(new Paragraph({
              spacing: { before: 180, after: 40 },
              
              tabStops: [{ type: TabStopType.LEFT, position: 8640 }],
              children: [
                new TextRun({ text: parts[0], bold: true, font: 'Times New Roman', size: 22, color: '000000' }),
                new TextRun({ text: '\t' }),
                new TextRun({ text: parts[2], bold: true, font: 'Times New Roman', size: 22, color: '000000' })
              ]
            }));
            rows.push(new Paragraph({
              spacing: { before: 0, after: 60 },
              
              children: [new TextRun({ text: parts[1], font: 'Times New Roman', size: 22, color: '000000' })]
            }));
          }
          return rows;
        }
        // Plain text lines
        return new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { right: 360 },
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

    // Education Paragraphs (flex rows formatted as tab stops)
    const eduParagraphs = [sectionHead('Education')];
    P.education.forEach(e => {
      eduParagraphs.push(new Paragraph({
        spacing: { before: 180, after: 40 },
        
        tabStops: [{ type: TabStopType.LEFT, position: 8640 }],
        children: [
          new TextRun({ text: e.degree, bold: true, font: 'Times New Roman', size: 22, color: '000000' }),
          new TextRun({ text: '\t' }),
          new TextRun({ text: e.dates, bold: true, font: 'Times New Roman', size: 22, color: '000000' })
        ]
      }));
      eduParagraphs.push(new Paragraph({
        spacing: { before: 0, after: 60 },
        indent: { right: 360 },
        children: [new TextRun({ text: `${e.school}${e.location ? ', ' + e.location : ''}`, font: 'Times New Roman', size: 22, color: '000000' })]
      }));
    });

    // Contact children
    const displayLinkedin = P.linkedin.replace(/-[a-zA-Z0-9]*\d+[a-zA-Z0-9]*$/, '');
    const contactParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({ text: `${P.location}  |  ${P.phone}  |  `, font: 'Times New Roman', size: 22, color: '000000' }),
        new ExternalHyperlink({
          children: [
            new TextRun({ text: P.email, font: 'Times New Roman', size: 22, color: '0000ff', underline: true })
          ],
          link: `mailto:${P.email}`
        }),
        new TextRun({ text: '  |  ', font: 'Times New Roman', size: 22, color: '000000' }),
        new ExternalHyperlink({
          children: [
            new TextRun({ text: displayLinkedin, font: 'Times New Roman', size: 22, color: '0000ff', underline: true })
          ],
          link: `https://${P.linkedin}`
        })
      ]
    });

    const doc = new Document({
      numbering: { config:[{ reference:'bullets', levels:[{ level:0, format:LevelFormat.BULLET, text:'•', alignment:AlignmentType.LEFT, style:{ paragraph:{ indent: { left: 360, hanging: 360 } } } }] }] },
      styles: { default: { document: { run:{ font:'Times New Roman', size:22, color:'000000' } } } },
      sections:[{
        properties:{
          page:{
            size:{width:12240,height:15840},
            margin:{top:640,right:640,bottom:640,left:640},
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
          ...eduParagraphs
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, PROFILE.name.replace(/\s+/g, '_') + '_Resume.docx');

  } catch(err) {
    console.error(err);
    alert('Error generating DOCX: ' + err.message);
  }

  btn.disabled = false;
  btn.innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l4-4m-4 4l-4-4"/></svg> Download DOCX';
};

// ── EXPORT / IMPORT BACKUPS ──
function exportBackup() {
  const active = getActiveProfile();
  if (!active) {
    alert("No active candidate profile to backup.");
    return;
  }
  
  if (Object.keys(PROFILES).length === 0) {
    alert("No candidate profiles exist to backup.");
    return;
  }
  
  const custom = {};
  Object.keys(PROFILES).forEach(key => {
    custom[key] = {
      profile: PROFILES[key],
      text: DEFAULT_TEXTS[key]
    };
  });
  
  const customData = JSON.stringify(custom);
  const blob = new Blob([customData], { type: 'application/json' });
  saveAs(blob, active.name.replace(/\s+/g, '_') + '_backup.json');
}

function importBackup(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error("Invalid backup format");
      }
      
      let importCount = 0;
      Object.keys(parsed).forEach(key => {
        if (parsed[key] && parsed[key].profile && parsed[key].text) {
          PROFILES[key] = parsed[key].profile;
          DEFAULT_TEXTS[key] = parsed[key].text;
          importCount++;
        }
      });

      if (importCount === 0) {
        throw new Error("No valid candidate profiles found in the backup file");
      }

      saveCustomProfiles();
      repopulateSelector();
      
      const importedKeys = Object.keys(parsed).filter(k => parsed[k] && parsed[k].profile);
      if (importedKeys.length > 0) {
        switchCandidate(importedKeys[0]);
      }
      
      alert(`Successfully imported ${importCount} candidate profile(s) from backup!`);
    } catch(err) {
      alert("Failed to import backup: " + err.message);
    }
    input.value = '';
  };
  reader.readAsText(file);
}

// Populate company copy buttons and preview on load
window.addEventListener('DOMContentLoaded', () => {
  loadCustomProfiles();
  repopulateSelector();
  
  // Set up ResizeObserver to handle dynamic scaling cleanly and prevent race conditions on reload/resize
  const pane = document.querySelector('.preview-pane');
  if (pane) {
    const resizeObserver = new ResizeObserver(() => {
      adjustPreviewScale();
    });
    resizeObserver.observe(pane);
  }
  
  const keys = Object.keys(PROFILES);
  if (keys.length > 0) {
    switchCandidate(keys[0]);
  } else {
    switchCandidate(null);
  }
});

// Rerun preview builder on window load to ensure all stylesheets and layout dimensions have stabilized
window.addEventListener('load', () => {
  updatePreview();
});

// Also rerun when fonts are loaded to prevent layout shifts from fallback fonts
if (document.fonts) {
  document.fonts.ready.then(() => {
    updatePreview();
  });
}