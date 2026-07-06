// ── RESUME CONTENT PARSER MODULE ──

import { escHtml } from './ui.js';

export function parseSections(raw) {
  if (!raw) return [];
  
  // Match bracketed sections [SECTION TITLE] or SECTION TITLE: on a separate line
  const headerRx = /(?:^|\n)\s*(?:\[([^\]]+)\]:?|([A-Z\s&_]{2,40}):)\s*(?:\n|$)/g;
  
  const sections = [];
  let match;
  
  const matches = [];
  while ((match = headerRx.exec(raw)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      title: (match[1] || match[2]).trim()
    });
  }
  
  if (matches.length === 0) {
    return [{
      title: 'EXPERIENCE',
      type: 'experience',
      content: raw.trim()
    }];
  }
  
  const firstMatch = matches[0];
  if (firstMatch.index > 0) {
    const content = raw.substring(0, firstMatch.index).trim();
    if (content) {
      sections.push({
        title: '',
        type: 'custom',
        content: content
      });
    }
  }
  
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index + current.length;
    const end = next ? next.index : raw.length;
    const content = raw.substring(start, end).trim();
    
    let type = 'custom';
    const titleUpper = current.title.toUpperCase();
    if (/SUMMARY|ABOUT|PROFILE/i.test(titleUpper)) {
      type = 'summary';
    } else if (/SKILLS|TECHNICAL/i.test(titleUpper)) {
      type = 'skills';
    } else if (/EXPERIENCE|PROJECT|WORK|EMPLOYMENT|INTERNSHIP|HISTORY/i.test(titleUpper)) {
      type = 'experience';
    } else if (/EDUCATION|ACADEMIC/i.test(titleUpper)) {
      type = 'education';
    } else if (/CERTIFICATION|CERT|AWARD/i.test(titleUpper)) {
      type = 'certs';
    }
    
    sections.push({
      title: current.title,
      type: type,
      content: content
    });
  }
  
  return sections;
}

export function parseEducationLine(line) {
  const parts = line.split('|').map(p => p.trim());
  if (parts.length === 0 || !parts[0]) return null;
  
  const degree = parts[0] || '';
  const school = parts[1] || '';
  
  let dates = '';
  let location = '';
  
  if (parts.length === 3) {
    if (/\b\d{4}\b|\b(?:Present|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(parts[2])) {
      dates = parts[2];
    } else {
      location = parts[2];
    }
  } else if (parts.length >= 4) {
    const isPart2Date = /\b\d{4}\b|\b(?:Present|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(parts[2]);
    const isPart3Date = /\b\d{4}\b|\b(?:Present|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(parts[3]);
    
    if (isPart3Date && !isPart2Date) {
      location = parts[2];
      dates = parts[3];
      if (parts.length > 4) {
        location += ' | ' + parts.slice(4).join(' | ');
      }
    } else {
      dates = parts[2];
      location = parts[3];
      if (parts.length > 4) {
        location += ' | ' + parts.slice(4).join(' | ');
      }
    }
  }
  
  return { degree, school, dates, location };
}

export function rebuildTextFromSections(sections) {
  return sections.map(s => {
    if (s.title) {
      return `[${s.title}]\n${s.content}`;
    }
    return s.content;
  }).join('\n\n');
}

export function parseContent(raw) {
  if (!raw) return { summary: '', skills: '', experience: '', education: '', certs: '', sections: [] };
  
  const sections = parseSections(raw);
  
  const summarySec = sections.find(s => s.type === 'summary');
  const skillsSec = sections.find(s => s.type === 'skills');
  const experienceSecs = sections.filter(s => s.type === 'experience');
  
  const experience = experienceSecs.map(s => {
    if (s.title && s.title.toUpperCase() !== 'EXPERIENCE' && s.title.toUpperCase() !== 'PROFESSIONAL EXPERIENCE') {
      return `[${s.title}]\n${s.content}`;
    }
    return s.content;
  }).join('\n\n');
  
  const eduSec = sections.find(s => s.type === 'education');
  const certsSec = sections.find(s => s.type === 'certs');
  
  return {
    summary: summarySec ? summarySec.content : '',
    skills: skillsSec ? skillsSec.content : '',
    experience: experience,
    education: eduSec ? eduSec.content : '',
    certs: certsSec ? certsSec.content : '',
    sections: sections
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
