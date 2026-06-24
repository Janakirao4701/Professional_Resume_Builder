// ── PDF RESUME GENERATOR MODULE ──

import { activeProfile } from './state.js';
import { showToast } from './ui.js';

function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadPdfLib() {
  if (window.html2pdf) return window.html2pdf;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
  return window.html2pdf;
}

export async function downloadPdf() {
  const raw = document.getElementById('resume-text').value.trim();
  if (!raw) {
    showToast('Please enter some resume content before downloading.');
    return;
  }

  const btn = document.getElementById('pdf-btn');
  const mobBtn = document.getElementById('mobile-pdf-btn');
  
  if (btn) {
    btn.disabled = true;
    var originalHtml = btn.innerHTML;
    btn.innerHTML = 'Generating…';
  }
  showToast('Loading document dependencies…');

  const element = document.getElementById('resume-mockup');
  if (!element) {
    showToast('Error: Resume mockup element not found.');
    if (btn) btn.disabled = false;
    return;
  }
  
  // Save original styles
  const originalTransform = element.style.transform;
  const originalMarginBottom = element.style.marginBottom;
  
  // Temporarily reset transform to full scale for capture
  element.style.transform = 'none';
  element.style.marginBottom = '0';
  
  // Temporarily strip page shadows/margins for clean PDF page breaks
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

  try {
    // 1. Lazy load library
    const html2pdfLib = await loadPdfLib();
    showToast('Generating PDF document…');

    const opt = {
      margin:       0,
      filename:     `${activeProfile.id}_Resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2.5, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    await html2pdfLib().set(opt).from(element).save();
    showToast('PDF Resume downloaded successfully!');
  } catch (err) {
    console.error('[PDF Generation Error]', err);
    showToast('Error generating PDF: ' + err.message);
  } finally {
    // Restore original styles
    element.style.transform = originalTransform;
    element.style.marginBottom = originalMarginBottom;
    pages.forEach((p, i) => {
      if (originalPageStyles[i]) {
        p.style.boxShadow = originalPageStyles[i].boxShadow;
        p.style.margin = originalPageStyles[i].margin;
        p.style.border = originalPageStyles[i].border;
        p.style.borderRadius = originalPageStyles[i].borderRadius;
      }
    });
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}
