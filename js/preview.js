// ── RESUME PREVIEW RENDERER MODULE ──

import { activeProfile } from './state.js';
import { parseContent } from './parser.js';
import { escHtml } from './ui.js';

export let currentZoomScale = 1.0;

export function setZoomScale(scale) {
  // Keep zoom at 100% scale always as requested
}

export function adjustPreviewScale() {
  const mockup = document.getElementById('resume-mockup');
  if (mockup) {
    mockup.style.transform = 'none';
    mockup.style.transformOrigin = 'initial';
    mockup.style.marginBottom = '0';
    mockup.style.marginLeft = '0';
    mockup.style.marginRight = '0';
  }
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

export function updatePreviewRaw() {
  const raw = document.getElementById('resume-text').value.trim();
  const mockup = document.getElementById('resume-mockup');
  if (!mockup) return;

  const name = activeProfile.name;
  const subtitle = activeProfile.subtitle;

  if (!raw && !name) {
    mockup.innerHTML = `
      <div class="empty-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px; text-align: center;">
        <div class="empty-illustration" style="position: relative; margin-bottom: 20px; width: 140px; height: 180px; background: var(--color-paper); border: 1px dashed var(--color-chalk); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); display: flex; flex-direction: column; padding: 16px; gap: 8px; overflow: hidden; opacity: 0.7;">
          <!-- Name and title skeleton -->
          <div style="width: 50%; height: 8px; background: var(--color-chalk); border-radius: 4px;"></div>
          <div style="width: 30%; height: 6px; background: var(--color-mist); border-radius: 3px; margin-bottom: 8px;"></div>
          <!-- Sections skeleton -->
          <div style="width: 25%; height: 6px; background: var(--color-chalk); border-radius: 3px; border-left: 2px solid var(--color-signal-blue);"></div>
          <div style="width: 100%; height: 4px; background: var(--color-mist); border-radius: 2px;"></div>
          <div style="width: 90%; height: 4px; background: var(--color-mist); border-radius: 2px;"></div>
          <div style="width: 95%; height: 4px; background: var(--color-mist); border-radius: 2px; margin-bottom: 8px;"></div>
          
          <div style="width: 25%; height: 6px; background: var(--color-chalk); border-radius: 3px; border-left: 2px solid var(--color-signal-blue);"></div>
          <div style="width: 100%; height: 4px; background: var(--color-mist); border-radius: 2px;"></div>
          <div style="width: 85%; height: 4px; background: var(--color-mist); border-radius: 2px;"></div>
        </div>
        <span style="font-size: 13px; font-weight: 600; color: var(--color-carbon); margin-bottom: 6px; display: block;">Your Resume Preview</span>
        <p style="font-size: 11px; color: var(--color-pencil); line-height: 1.4; max-width: 200px; margin: 0;">Type or paste your experience in the editor to see a live print-ready preview.</p>
      </div>
    `;
    return;
  }

  const { summary, skills, experience } = parseContent(raw);
  const elements = [];

  function createEl(htmlStr) {
    const div = document.createElement('div');
    div.innerHTML = htmlStr.trim();
    return div.firstElementChild || div;
  }

  // 1. Header (Name, Subtitle, Contact)
  const contactParts = [];
  if (activeProfile.location) contactParts.push(escHtml(activeProfile.location));
  if (activeProfile.phone) contactParts.push(escHtml(activeProfile.phone));
  if (activeProfile.email) contactParts.push(`<a href="mailto:${escHtml(activeProfile.email)}">${escHtml(activeProfile.email)}</a>`);
  if (activeProfile.linkedin) {
    let rawUrl = activeProfile.linkedin.trim();
    let hrefUrl = rawUrl;
    if (!/^https?:\/\//i.test(hrefUrl)) {
      hrefUrl = 'https://' + hrefUrl;
    }
    let display = rawUrl.replace(/^https?:\/\//i, '');
    display = display.replace(/^www\./i, '');
    display = display.replace(/-[a-zA-Z0-9]+(?=\/?$)/, '');
    display = display.replace(/\/+$/, '');
    contactParts.push(`<a href="${escHtml(hrefUrl)}" target="_blank" rel="noopener noreferrer">${escHtml(display)}</a>`);
  }
  const contactHtml = contactParts.join(' &nbsp;|&nbsp; ');

  elements.push(createEl(`
    <div style="text-align: center;">
      <div class="mock-name">${escHtml(name || '')}</div>
      <div class="mock-subtitle">${escHtml(subtitle || '')}</div>
      <div class="mock-contact">${contactHtml}</div>
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
  const education = activeProfile.education || [];
  if (education.length) {
    elements.push(createEl(`<div class="mock-section-head">EDUCATION:</div>`));
    education.forEach(e => {
      elements.push(createEl(`
        <div class="mock-edu-row">
          <span>${escHtml(e.degree || '')}</span>
          <span>${escHtml(e.dates || '')}</span>
        </div>
      `));
      elements.push(createEl(`<div class="mock-edu-school">${escHtml(e.school || '')}${e.location ? ', ' + escHtml(e.location) : ''}</div>`));
    });
  }

  // 6. Certifications
  const certs = activeProfile.certs || [];
  if (certs.length) {
    elements.push(createEl(`<div class="mock-section-head">CERTIFICATIONS:</div>`));
    certs.forEach(c => {
      elements.push(createEl(`<div class="mock-bullet">${escHtml(c)}</div>`));
    });
  }

  // Paginate elements dynamically
  mockup.innerHTML = '';
  
  function createPageEl(num) {
    const page = document.createElement('div');
    page.className = 'preview-page';
    page.id = `page-${num}`;
    page.innerHTML = `
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

  // Dynamically inject non-printable Page X of Y indicators
  const pages = mockup.querySelectorAll('.preview-page');
  const totalPages = pages.length;
  pages.forEach((page, index) => {
    const pNum = index + 1;
    const indicator = document.createElement('div');
    indicator.className = 'page-indicator';
    indicator.textContent = `Page ${pNum} of ${totalPages}`;
    page.parentNode.insertBefore(indicator, page);
  });

  if (typeof window.updateCombinedPromptPreview === 'function') {
    window.updateCombinedPromptPreview();
  }
  
  setTimeout(adjustPreviewScale, 10);
}

let updatePreviewTimeout = null;
export function updatePreview() {
  clearTimeout(updatePreviewTimeout);
  updatePreviewTimeout = setTimeout(updatePreviewRaw, 300); // 300ms debounce
}

export function updatePreviewImmediate() {
  clearTimeout(updatePreviewTimeout);
  updatePreviewRaw();
}
