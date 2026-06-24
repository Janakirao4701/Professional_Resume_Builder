// ── RESUME PREVIEW RENDERER MODULE ──

import { activeProfile } from './state.js';
import { parseContent } from './parser.js';
import { escHtml } from './ui.js';

export let currentZoomScale = 'auto';
let isScaling = false;
let lastPaneWidth = 0;
let lastMockupWidth = 0;
let lastMockupHeight = 0;

export function setZoomScale(scale) {
  currentZoomScale = scale;
  
  const pane = document.querySelector('.preview-pane');
  if (pane) {
    if (scale === 'scroll') {
      pane.classList.add('scrollable-mode');
    } else {
      pane.classList.remove('scrollable-mode');
    }
  }
  
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

export function adjustPreviewScale() {
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

export function updatePreviewRaw() {
  const raw = document.getElementById('resume-text').value.trim();
  const mockup = document.getElementById('resume-mockup');
  if (!mockup) return;

  const name = activeProfile.name;
  const subtitle = activeProfile.subtitle;

  if (!raw && !name) {
    mockup.innerHTML = `<div class="empty-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center;"><svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--app-ink-muted); margin-bottom: 8px;"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0A2.25 2.25 0 0 1 13.5 4.75h-3a2.25 2.25 0 0 1-2.166-1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.346.102.637.318.806.622L18 7.5V19.5a2.25 2.25 0 0 1-2.25 2.25H8.25A2.25 2.25 0 0 1 6 19.5V7.5l1.112-2.012a1.125 1.125 0 0 1 .806-.622" /></svg><p>Paste your resume content above to see a live preview here</p></div>`;
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
    contactParts.push(`<a href="${escHtml(hrefUrl)}" target="_blank">${escHtml(display)}</a>`);
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
