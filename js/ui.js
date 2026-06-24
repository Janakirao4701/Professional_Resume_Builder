// ── UI AND DIALOG INTERACTIONS MODULE ──

let undoStack = [];
let redoStack = [];
const MAX_UNDO_DEPTH = 20;

export function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/`/g, '&#x60;')
            .replace(/\//g, '&#x2F;');
}

export function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="color:#3b82f6; flex-shrink: 0; display: inline-block; vertical-align: middle; margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.5c1.153-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg> <span>${escHtml(message)}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 2500);
}

function ensureCustomDialogInDOM() {
  let dialog = document.getElementById('custom-modal-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'custom-modal-dialog';
    dialog.setAttribute('aria-modal', 'true');
    dialog.role = 'dialog';
    dialog.innerHTML = `
      <h3 id="modal-title" style="margin-top:0; margin-bottom:8px; font-size:15px; color:var(--app-ink);"></h3>
      <p id="modal-message" style="margin:0 0 12px 0; font-size:13px; color:var(--app-ink-muted);"></p>
      <div id="modal-input-wrapper" style="display: none; margin-top: 12px;">
        <input type="text" id="modal-input-field" class="form-input" style="width: 100%; border: 1px solid var(--app-border); border-radius: 4px; padding: 6px 8px; background: var(--app-bg); color: var(--app-ink); font-size: 13px; outline:none;" aria-label="Input field">
        <span id="modal-input-error" class="error-text" style="display: none; font-size: 11px; color: var(--color-pale-red); margin-top: 4px;"></span>
      </div>
      <div class="modal-actions" style="margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px;">
        <button id="modal-cancel-btn" class="btn-dl" style="padding: 4px 12px; font-size: 12px; background:var(--app-bg); color:var(--app-ink); border:1px solid var(--app-border);">Cancel</button>
        <button id="modal-confirm-btn" class="btn-dl btn-hdr-primary" style="padding: 4px 12px; font-size: 12px; border:none; background:var(--app-accent); color:#fff;">Confirm</button>
      </div>
    `;
    document.body.appendChild(dialog);
  }
  return dialog;
}

export function customConfirm(title, message) {
  return new Promise((resolve) => {
    const dialog = ensureCustomDialogInDOM();
    
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

export function customPrompt(title, defaultValue = '') {
  return new Promise((resolve) => {
    const dialog = ensureCustomDialogInDOM();
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = '';
    document.getElementById('modal-input-wrapper').style.display = 'block';
    
    const inputField = document.getElementById('modal-input-field');
    inputField.value = defaultValue;
    
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    
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

// ── UNDO / REDO TEXTAREA VERSION STACK ──

export function recordStateChange(text) {
  if (undoStack.length > 0 && undoStack[undoStack.length - 1] === text) {
    return;
  }
  undoStack.push(text);
  if (undoStack.length > MAX_UNDO_DEPTH) {
    undoStack.shift();
  }
  redoStack = []; // clear redo stack on fresh edit
  updateUndoRedoButtons();
}

export function undoEdit() {
  if (undoStack.length <= 1) return;
  const current = undoStack.pop();
  redoStack.push(current);
  const previous = undoStack[undoStack.length - 1];
  
  const textarea = document.getElementById('resume-text');
  if (textarea) {
    textarea.value = previous;
    textarea.dispatchEvent(new Event('input'));
  }
  updateUndoRedoButtons();
}

export function redoEdit() {
  if (redoStack.length === 0) return;
  const nextState = redoStack.pop();
  undoStack.push(nextState);
  
  const textarea = document.getElementById('resume-text');
  if (textarea) {
    textarea.value = nextState;
    textarea.dispatchEvent(new Event('input'));
  }
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
  if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

// ── THEME MANAGER ──

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('resume_builder_theme', newTheme);
  updateThemeToggleIcon();
  showToast(`Switched to ${newTheme} theme`);
}

export function initTheme() {
  const savedTheme = localStorage.getItem('resume_builder_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
  const btn = document.getElementById('theme-toggle-btn');
  const mobBtn = document.getElementById('mobile-theme-toggle-btn');
  if (!btn && !mobBtn) return;
  
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const sunIcon = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right:6px; vertical-align:middle; display:inline-block;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>`;
  const moonIcon = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right:6px; vertical-align:middle; display:inline-block;"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>`;

  if (currentTheme === 'dark') {
    if (btn) btn.innerHTML = `${sunIcon}<span>Light Mode</span>`;
    if (mobBtn) mobBtn.innerHTML = `${sunIcon}<span>Light Mode</span>`;
  } else {
    if (btn) btn.innerHTML = `${moonIcon}<span>Dark Mode</span>`;
    if (mobBtn) mobBtn.innerHTML = `${moonIcon}<span>Dark Mode</span>`;
  }
}

// ── KEYBOARD SHORTCUTS DIALOG ──

export function toggleShortcutsModal(show) {
  let modal = document.getElementById('shortcuts-modal-dialog');
  if (!modal) {
    modal = document.createElement('dialog');
    modal.id = 'shortcuts-modal-dialog';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.border = '1px solid var(--app-border)';
    modal.style.background = 'var(--app-surface)';
    modal.style.color = 'var(--app-ink)';
    modal.style.maxWidth = '360px';
    modal.style.width = '90%';
    modal.style.outline = 'none';
    
    modal.innerHTML = `
      <h3 style="margin-top:0; margin-bottom:12px; font-size:15px; color:var(--app-ink);">Keyboard Shortcuts</h3>
      <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; color:var(--app-ink-muted);">
        <tr style="border-bottom:1px solid var(--app-border);"><td style="padding:6px 0; color:var(--app-accent); font-weight:600;">Ctrl + N</td><td>Create New Profile</td></tr>
        <tr style="border-bottom:1px solid var(--app-border);"><td style="padding:6px 0; color:var(--app-accent); font-weight:600;">Ctrl + Z</td><td>Undo Last Change</td></tr>
        <tr style="border-bottom:1px solid var(--app-border);"><td style="padding:6px 0; color:var(--app-accent); font-weight:600;">Ctrl + Y</td><td>Redo Last Change</td></tr>
        <tr style="border-bottom:1px solid var(--app-border);"><td style="padding:6px 0; color:var(--app-accent); font-weight:600;">Ctrl + P</td><td>Download PDF</td></tr>
        <tr style="border-bottom:1px solid var(--app-border);"><td style="padding:6px 0; color:var(--app-accent); font-weight:600;">Ctrl + D</td><td>Download DOCX</td></tr>
        <tr style="border-bottom:1px solid var(--app-border);"><td style="padding:6px 0; color:var(--app-accent); font-weight:600;">? or Ctrl + /</td><td>Toggle Shortcuts Help</td></tr>
      </table>
      <div style="margin-top:16px; text-align:right;">
        <button onclick="document.getElementById('shortcuts-modal-dialog').close()" class="btn-dl" style="padding:4px 12px; font-size:12px; background:var(--app-bg); border:1px solid var(--app-border); color:var(--app-ink);">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  if (show === undefined) {
    if (modal.open) modal.close();
    else modal.showModal();
  } else if (show) {
    if (!modal.open) modal.showModal();
  } else {
    if (modal.open) modal.close();
  }
}
