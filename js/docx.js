// ── DOCX RESUME GENERATOR MODULE ──

import { activeProfile } from './state.js';
import { parseContent } from './parser.js';
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

async function loadDocxLib() {
  if (window.docx) return window.docx;
  await loadScript('https://cdn.jsdelivr.net/npm/docx@7.3.0/build/index.js');
  return window.docx;
}

function saveAs(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

export async function downloadDocx() {
  const raw = document.getElementById('resume-text').value.trim();
  if (!raw) {
    showToast('Please enter some resume content before downloading.');
    return;
  }

  const btn = document.getElementById('dl-btn');
  const mobBtn = document.getElementById('mobile-dl-btn');
  
  if (btn) {
    btn.disabled = true;
    btn.classList.add('loading');
  }
  showToast('Loading document dependencies…');

  try {
    // 1. Lazy load library
    const docxLib = await loadDocxLib();
    showToast('Generating DOCX document…');

    const { Document, Packer, Paragraph, TextRun, ExternalHyperlink,
            AlignmentType, BorderStyle, LevelFormat, TabStopType } = docxLib;

    const { summary, skills, experience } = parseContent(raw);

    // Headings format
    function sectionHead(text) {
      return new Paragraph({
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000', space: 2 } },
        children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: 'Times New Roman', color: '000000' })]
      });
    }

    // Bullet items
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

    // Skills logic
    function skillsDocx(rawSkills) {
      if (!rawSkills) return [];
      return rawSkills.split('\n').filter(l => l.trim()).map(line => {
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

    // Experience logic
    function expDocx(rawExp) {
      if (!rawExp) return [];
      return rawExp.split('\n').filter(l => l.trim()).map(line => {
        const t = line.trim();
        if (/^[-•*–—\u2013\u2014\u2022]/.test(t)) return bullet(t.replace(/^[-•*–—\u2013\u2014\u2022]\s*/, ''));
        if (t.includes('|')) {
          const parts = t.split('|').map(p => p.trim());
          const rows = [];
          if (parts.length >= 4) {
            rows.push(new Paragraph({
              spacing: { before: 180, after: 40 },
              tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
              children: [
                new TextRun({ text: parts[0], bold: true, font: 'Times New Roman', size: 22, color: '000000' }),
                new TextRun({ text: '\t' }),
                new TextRun({ text: parts[3], bold: true, font: 'Times New Roman', size: 22, color: '000000' })
              ]
            }));
            rows.push(new Paragraph({
              spacing: { before: 0, after: 60 },
              tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
              children: [
                new TextRun({ text: parts[2], font: 'Times New Roman', size: 22, color: '000000' }),
                new TextRun({ text: '\t' }),
                new TextRun({ text: parts[1], font: 'Times New Roman', size: 22, color: '000000' })
              ]
            }));
          } else if (parts.length === 3) {
            rows.push(new Paragraph({
              spacing: { before: 180, after: 40 },
              tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
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
        return new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [new TextRun({ text: t, font: 'Times New Roman', size: 22, color: '000000' })]
        });
      }).flat();
    }

    const summaryParagraphs = [];
    if (summary) {
      summaryParagraphs.push(sectionHead('Professional Summary'));
      summaryParagraphs.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: summary, font: 'Times New Roman', size: 22, color: '000000' })]
      }));
    }

    const eduParagraphs = [sectionHead('Education')];
    const education = activeProfile.education || [];
    education.forEach(e => {
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

    const certParagraphs = [];
    const certs = activeProfile.certs || [];
    const activeCerts = certs.map(c => c.trim()).filter(Boolean);
    if (activeCerts.length) {
      certParagraphs.push(sectionHead('Certifications'));
      activeCerts.forEach(c => {
        certParagraphs.push(bullet(c));
      });
    }

    const contactChildren = [];
    const textSeparator = () => new TextRun({ text: '  |  ', font: 'Times New Roman', size: 22, color: '000000' });
    
    const contactParts = [];
    if (activeProfile.location) contactParts.push(activeProfile.location);
    if (activeProfile.phone) contactParts.push(activeProfile.phone);
    if (contactParts.length > 0) {
      contactChildren.push(new TextRun({ text: contactParts.join('  |  '), font: 'Times New Roman', size: 22, color: '000000' }));
    }
    
    if (activeProfile.email) {
      if (contactChildren.length > 0) contactChildren.push(textSeparator());
      contactChildren.push(new ExternalHyperlink({
        children: [
          new TextRun({ text: activeProfile.email, font: 'Times New Roman', size: 22, color: '0000ff', underline: true })
        ],
        link: `mailto:${activeProfile.email}`
      }));
    }
    
    if (activeProfile.linkedin) {
      if (contactChildren.length > 0) contactChildren.push(textSeparator());
      let rawLinkedin = activeProfile.linkedin.trim();
      let hrefLinkedin = rawLinkedin;
      if (!/^https?:\/\//i.test(hrefLinkedin)) {
        hrefLinkedin = 'https://' + hrefLinkedin;
      }
      let displayLinkedin = rawLinkedin.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/-[a-zA-Z0-9]+(?=\/?$)/, '').replace(/\/+$/, '');
      
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
          new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:80}, children:[new TextRun({text:activeProfile.name || '', bold:true, font:'Times New Roman', size:28, color:'000000'})] }),
          new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:120}, children:[new TextRun({text:activeProfile.subtitle || '', bold:true, font:'Times New Roman', size:22, color:'000000'})] }),
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
    saveAs(blob, `${activeProfile.id}_Resume.docx`);
    showToast('DOCX Resume downloaded successfully!');

  } catch(err) {
    console.error('[DOCX Generation Error]', err);
    showToast('Error generating DOCX: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  }
}
