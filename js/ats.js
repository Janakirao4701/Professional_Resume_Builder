// ── ATS SCORING & REAL-TIME KEYWORD TRACKER MODULE ──

import { activeProfile, saveToStorage, saveToStorageImmediate } from './state.js';
import { escHtml, showToast } from './ui.js';

export async function analyzeATSScore() {
  const resumeText = document.getElementById('resume-text').value;
  const jdText = document.getElementById('jd-text') ? document.getElementById('jd-text').value.trim() : "";
  
  if (!resumeText || !resumeText.trim()) {
    showToast("Please enter some resume experience text first.");
    return;
  }
  if (!jdText || !jdText.trim()) {
    showToast("Analyzing general resume quality and formatting...");
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
    
    // Save current run to score history
    if (!activeProfile.score_history) {
      activeProfile.score_history = [];
    }
    
    // Save to profile and local storage
    activeProfile.ats_results = data;
    
    const newHistory = [...activeProfile.score_history];
    newHistory.push({
      date: new Date().toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      score: data.overall,
      ats: data.ats,
      recruiter: data.recruiter,
      technical: data.technical
    });
    if (newHistory.length > 5) {
      newHistory.shift();
    }
    activeProfile.score_history = newHistory;
    
    saveToStorageImmediate();
    localStorage.setItem('resume_builder_ats_results', JSON.stringify(data));
    
    renderScoringUI(data);
    showToast("Resume analysis completed successfully!");
  } catch (err) {
    console.error('[ATS Score Run Error]', err);
    showToast("Analysis Error: " + err.message);
  } finally {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }
}

export function getScoreColor(val) {
  if (val >= 80) return '#22c55e';
  if (val >= 60) return '#eab308';
  return '#ef4444';
}

export function updateHeaderScoreBadge(score) {
  const badge = document.getElementById('header-ats-badge');
  const valEl = document.getElementById('header-ats-score-val');
  if (!badge || !valEl) return;

  badge.classList.remove('no-score', 'low-score', 'mid-score', 'high-score');

  if (score === null || score === undefined || score === '--') {
    valEl.textContent = '--';
    badge.classList.add('no-score');
    return;
  }

  const targetVal = parseInt(score);
  if (isNaN(targetVal)) {
    valEl.textContent = '--';
    badge.classList.add('no-score');
    return;
  }

  if (targetVal >= 85) {
    badge.classList.add('high-score');
  } else if (targetVal >= 70) {
    badge.classList.add('mid-score');
  } else {
    badge.classList.add('low-score');
  }

  const currentValText = valEl.textContent;
  const currentVal = (currentValText === '--' || isNaN(parseInt(currentValText))) ? 0 : parseInt(currentValText);

  if (currentVal !== targetVal) {
    const duration = 1000;
    const startTime = performance.now();
    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * (targetVal - currentVal) + currentVal);
      valEl.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
      else valEl.textContent = targetVal;
    };
    requestAnimationFrame(update);
  } else {
    valEl.textContent = targetVal;
  }
}

export function clearScoringUI() {
  const emptyState = document.getElementById('score-empty-state');
  if (emptyState) emptyState.style.display = 'flex';

  const detailsContainer = document.getElementById('score-details-container');
  if (detailsContainer) detailsContainer.style.display = 'none';

  updateHeaderScoreBadge('--');
}

export function renderScoringUI(data) {
  const emptyState = document.getElementById('score-empty-state');
  if (emptyState) emptyState.style.display = 'none';

  const detailsContainer = document.getElementById('score-details-container');
  if (detailsContainer) detailsContainer.style.display = 'block';

  updateHeaderScoreBadge(data.overall);

  // Fetch previous score for delta calculation
  const history = activeProfile.score_history || [];
  const prevRun = history.length > 1 ? history[history.length - 2] : null;

  function deltaStr(cur, prev) {
    if (prev === null || prev === undefined) return '';
    const diff = cur - prev;
    if (diff === 0) return '';
    return diff > 0 
      ? ` <span class="score-delta up" style="color:#22c55e; font-size:11px; font-weight:bold; margin-left:4px;">↑${diff}</span>` 
      : ` <span class="score-delta down" style="color:#ef4444; font-size:11px; font-weight:bold; margin-left:4px;">↓${Math.abs(diff)}</span>`;
  }

  // Update overall badge
  const overallBadge = document.getElementById('overall-score-badge');
  if (overallBadge) {
    overallBadge.innerHTML = `${data.overall}/100${prevRun ? deltaStr(data.overall, prevRun.score) : ''}`;
  }
  
  const pctText = document.getElementById('overall-score-pct');
  if (pctText) pctText.textContent = `${data.overall}%`;
  
  const ringFill = document.getElementById('overall-radial-fill');
  if (ringFill) {
    ringFill.setAttribute('stroke-dasharray', `${data.overall}, 100`);
    ringFill.style.stroke = getScoreColor(data.overall);
  }

  const formulaNote = document.getElementById('score-formula-note');
  if (formulaNote) formulaNote.style.display = 'block';

  // Set dimension scores
  const atsVal = document.getElementById('ats-score-val');
  if (atsVal) atsVal.innerHTML = `${data.ats}/100${prevRun ? deltaStr(data.ats, prevRun.ats) : ''}`;
  const atsBar = document.getElementById('ats-score-bar');
  if (atsBar) {
    atsBar.style.width = `${data.ats}%`;
    atsBar.style.background = getScoreColor(data.ats);
  }
  
  const recVal = document.getElementById('recruiter-score-val');
  if (recVal) recVal.innerHTML = `${data.recruiter}/100${prevRun ? deltaStr(data.recruiter, prevRun.recruiter) : ''}`;
  const recBar = document.getElementById('recruiter-score-bar');
  if (recBar) {
    recBar.style.width = `${data.recruiter}%`;
    recBar.style.background = getScoreColor(data.recruiter);
  }
  
  const techVal = document.getElementById('technical-score-val');
  if (techVal) techVal.innerHTML = `${data.technical}/100${prevRun ? deltaStr(data.technical, prevRun.technical) : ''}`;
  const techBar = document.getElementById('technical-score-bar');
  if (techBar) {
    techBar.style.width = `${data.technical}%`;
    techBar.style.background = getScoreColor(data.technical);
  }

  // Populate Keyword Tags
  updateKeywordTagsUI(data);

  // Suggestions checklist rendering
  const listContainer = document.getElementById('suggestions-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    
    let matchClass = "match-level-weak";
    if (data.overall >= 85) matchClass = "match-level-excellent";
    else if (data.overall >= 70) matchClass = "match-level-strong";
    else if (data.overall >= 50) matchClass = "match-level-moderate";

    let html = `<div class="match-level-badge ${matchClass}">Match Level: ${data.matchLevel}</div>`;

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

  // Score Run History Comparison UI Render
  renderScoreHistoryUI();
}

function renderScoreHistoryUI() {
  let historyContainer = document.getElementById('score-history-container');
  if (!historyContainer) {
    historyContainer = document.createElement('div');
    historyContainer.id = 'score-history-container';
    historyContainer.style.marginTop = '16px';
    historyContainer.style.paddingTop = '12px';
    historyContainer.style.borderTop = '1px solid var(--app-border)';
    const detailsContainer = document.getElementById('score-details-container');
    if (detailsContainer) detailsContainer.appendChild(historyContainer);
  }
  
  const history = activeProfile.score_history || [];
  if (history.length > 1) {
    historyContainer.style.display = 'block';
    historyContainer.innerHTML = `
      <div style="font-size:11px; font-weight:700; color:var(--app-ink-muted); text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>Score Run History</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        ${history.map((h, i) => `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; padding:6px; background:var(--app-bg); border-radius:4px; border:1px solid var(--app-border);">
            <span style="color:var(--app-ink-muted);">Run #${i+1} (${h.date})</span>
            <span style="font-weight:700; color:${getScoreColor(h.score)};">${h.score}/100</span>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    historyContainer.style.display = 'none';
  }
}

export function updateKeywordTagsUI(data) {
  const matchedContainer = document.getElementById('matched-kw-tags');
  const missingContainer = document.getElementById('missing-kw-tags');
  const rateLabel = document.getElementById('keyword-match-rate');
  const countLabel = document.getElementById('keyword-match-count');
  
  if (!matchedContainer || !missingContainer) return;
  
  const total = (data.criticalMatched?.length || 0) + (data.criticalMissing?.length || 0) + 
                (data.importantMatched?.length || 0) + (data.importantMissing?.length || 0) + 
                (data.preferredMatched?.length || 0) + (data.preferredMissing?.length || 0);
  
  const matched = (data.criticalMatched?.length || 0) + (data.importantMatched?.length || 0) + (data.preferredMatched?.length || 0);
  const rate = total > 0 ? Math.round((matched / total) * 100) : 0;
  
  if (rateLabel) rateLabel.textContent = `${rate}%`;
  if (countLabel) countLabel.textContent = `${matched} of ${total} keywords`;
  
  const kwFeedback = document.getElementById('keyword-feedback');
  if (kwFeedback) {
    kwFeedback.style.display = total === 0 ? 'none' : 'block';
  }

  const atsGapNote = document.getElementById('ats-gap-note');
  if (atsGapNote && Math.abs(rate - data.ats) > 5) {
    atsGapNote.style.display = 'block';
  } else if (atsGapNote) {
    atsGapNote.style.display = 'none';
  }

  matchedContainer.innerHTML = [
    ...(data.criticalMatched || []).map(k => `<span class="kw-tag match critical" title="Critical Requirement">${escHtml(k)} (C)</span>`),
    ...(data.importantMatched || []).map(k => `<span class="kw-tag match important" title="Important Requirement">${escHtml(k)} (I)</span>`),
    ...(data.preferredMatched || []).map(k => `<span class="kw-tag match preferred" title="Preferred Requirement">${escHtml(k)} (P)</span>`)
  ].join('');

  missingContainer.innerHTML = [
    ...(data.criticalMissing || []).map(k => `<span class="kw-tag missing critical" title="Critical Requirement">${escHtml(k)} (C)</span>`),
    ...(data.importantMissing || []).map(k => `<span class="kw-tag missing important" title="Important Requirement">${escHtml(k)} (I)</span>`),
    ...(data.preferredMissing || []).map(k => `<span class="kw-tag missing preferred" title="Preferred Requirement">${escHtml(k)} (P)</span>`)
  ].join('');
}

// Scans the resume text against the loaded ATS keywords in real-time, moving matches to active lists
export function scanKeywordsRealtime() {
  const raw = document.getElementById('resume-text').value;
  const results = activeProfile.ats_results;
  if (!results) return;
  
  // Collect all unique keywords in current lists
  const allKeywords = [
    ...(results.criticalMatched || []).map(k => ({ text: k, cat: 'critical' })),
    ...(results.criticalMissing || []).map(k => ({ text: k, cat: 'critical' })),
    ...(results.importantMatched || []).map(k => ({ text: k, cat: 'important' })),
    ...(results.importantMissing || []).map(k => ({ text: k, cat: 'important' })),
    ...(results.preferredMatched || []).map(k => ({ text: k, cat: 'preferred' })),
    ...(results.preferredMissing || []).map(k => ({ text: k, cat: 'preferred' }))
  ];
  
  const unique = [];
  const seen = new Set();
  allKeywords.forEach(k => {
    const key = `${k.text.toLowerCase()}||${k.cat}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(k);
    }
  });

  const criticalMatched = [];
  const criticalMissing = [];
  const importantMatched = [];
  const importantMissing = [];
  const preferredMatched = [];
  const preferredMissing = [];

  unique.forEach(item => {
    const word = item.text;
    const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const isShort = word.length <= 2;
    const regex = isShort ? new RegExp(`\\b${escaped}\\b`, 'i') : new RegExp(escaped, 'i');
    const matches = regex.test(raw);

    if (item.cat === 'critical') {
      if (matches) criticalMatched.push(word);
      else criticalMissing.push(word);
    } else if (item.cat === 'important') {
      if (matches) importantMatched.push(word);
      else importantMissing.push(word);
    } else if (item.cat === 'preferred') {
      if (matches) preferredMatched.push(word);
      else preferredMissing.push(word);
    }
  });

  results.criticalMatched = criticalMatched;
  results.criticalMissing = criticalMissing;
  results.importantMatched = importantMatched;
  results.importantMissing = importantMissing;
  results.preferredMatched = preferredMatched;
  results.preferredMissing = preferredMissing;

  activeProfile.ats_results = results;
  updateKeywordTagsUI(results);
}
