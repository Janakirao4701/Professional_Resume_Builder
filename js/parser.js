// ── RESUME CONTENT PARSER MODULE ──

import { escHtml } from './ui.js';

export function parseContent(raw) {
  if (!raw) return { summary: '', skills: '', experience: '' };
  
  const summaryRx   = /(?:^|\n)\s*\[?(?:SUMMARY|PROFESSIONAL SUMMARY)\]?:?\s*([\s\S]*?)(?=(?:\n\s*\[?(?:SKILLS|TECHNICAL SKILLS|EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS)\]?:?)|$)/i;
  const skillsRx    = /(?:^|\n)\s*\[?(?:SKILLS|TECHNICAL SKILLS)\]?:?\s*([\s\S]*?)(?=(?:\n\s*\[?(?:SUMMARY|PROFESSIONAL SUMMARY|EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS)\]?:?)|$)/i;
  const experienceRx= /(?:^|\n)\s*\[?(?:EXPERIENCE|PROFESSIONAL EXPERIENCE)\]?:?\s*([\s\S]*?)(?=(?:\n\s*\[?(?:SUMMARY|PROFESSIONAL SUMMARY|SKILLS|TECHNICAL SKILLS|EDUCATION|CERTIFICATIONS)\]?:?)|$)/i;

  const sMatch = raw.match(summaryRx);
  const kMatch = raw.match(skillsRx);
  const eMatch = raw.match(experienceRx);

  return {
    summary: sMatch ? sMatch[1].trim() : '',
    skills: kMatch ? kMatch[1].trim() : '',
    experience: eMatch ? eMatch[1].trim() : ''
  };
}

export function parseCompanies(raw) {
  const { experience } = parseContent(raw);
  const section = document.getElementById('company-section');
  const btnsContainer = document.getElementById('company-btns');
  
  if (!experience || !section || !btnsContainer) {
    if (section) section.classList.remove('visible');
    return;
  }

  const lines = experience.split('\n').filter(l => l.trim());
  const companies = [];
  let current = null;

  lines.forEach(line => {
    const t = line.trim();
    if (t.includes('|') && !/^[-•*]/.test(t)) {
      // Company header line: Company | Location | Role | Dates
      const parts = t.split('|').map(p => p.trim());
      const companyName = parts[0];
      current = { name: companyName, fullHeader: t, bullets: [] };
      companies.push(current);
    } else if (/^[-•*]/.test(t) && current) {
      current.bullets.push(t);
    }
  });

  if (companies.length === 0) {
    section.classList.remove('visible');
    return;
  }

  section.classList.add('visible');
  btnsContainer.innerHTML = companies.map((c, i) =>
    `<button class="company-copy-btn" id="company-btn-${i}" onclick="copyCompanyExp(${i})" type="button">
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 6px; display: inline-block; vertical-align: middle;" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      <span>${escHtml(c.name)} Experience</span>
      <span class="copy-label">Click to copy</span>
    </button>`
  ).join('');

  window._parsedCompanies = companies;
}
