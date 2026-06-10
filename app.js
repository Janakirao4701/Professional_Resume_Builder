// Candidates Data
const HARDCODED_PROFILES = {
  pravallika: {
  name:     'Pravallika Boyapati',
  subtitle: 'Controls Engineer',
  email:    'pravallikab1279@gmail.com',
  phone:    '+1 (469) 213-0772',
  location: 'Dallas, USA',
  linkedin: 'linkedin.com/in/pravallika17',
  education: [
    { degree: 'Master of Science in Computer Engineering', dates: '06/2021 – 05/2023', school: 'University of Houston-Clear Lake', location: 'Houston, TX' },
    { degree: 'Bachelor of Technology in Computer Science and Engineering', dates: '06/2016 – 05/2020', school: 'SRK Institute of Technology (JNTUK)', location: 'Andhra Pradesh, India' }
  ],
  certs: []
},
  hardhik: {
  name:     'Hardhik Rao Chidura',
  title:    'PLC Controls & Automation Engineer',
  subtitle: 'PLC Controls & Automation | HMI/SCADA Engineer',
  email:    'hardhikraochidura@gmail.com',
  phone:    '+1 (845) 484-9588',
  location: 'Wyoming, USA',
  openTo:   'Open to: On-site / Hybrid / Remote',
  linkedin: 'linkedin.com/in/hardhik-rao-chidura-9882a9248',
  education: [
    { degree: 'Master of Science in Information Systems', dates: '08/2022 - 05/2024', school: 'Marist University', location: 'New York, USA' },
    { degree: 'Bachelor of Science in Computer Science and Engineering', dates: '07/2017 - 04/2020', school: 'Nishitha Degree College', location: 'India' }
  ],
  certs: []
},
  mounika: {
  name:     'Mounika Yella',
  title:    'Controls Engineer',
  subtitle: 'Controls Engineer',
  email:    'mounikayella1798@gmail.com',
  phone:    '+1 (469) 269-0429',
  location: 'Dallas, USA',
  openTo:   'Open to: On-site / Hybrid / Remote',
  linkedin: 'linkedin.com/in/mounika-yella',
  education: [
    { degree: 'Master of Science in Computer Engineering', dates: '05/2021 – 06/2023', school: 'University of Houston-Clear Lake', location: 'Houston, TX' },
    { degree: 'Bachelor of Technology in Computer Science and Engineering', dates: '06/2016 – 05/2020', school: 'SRK Institute of Technology (JNTUK)', location: 'Andhra Pradesh, India' }
  ],
  certs: []
}
};

const HARDCODED_TEXTS = {
  pravallika: `[PROFESSIONAL SUMMARY]
Controls Engineer with 4+ years of experience designing, programming, commissioning, and supporting PLC-based automation systems across manufacturing, oil & gas, and automotive industries. Expertise in Siemens and Allen-Bradley PLCs, HMI/SCADA development, robotics integration, industrial networking, and commissioning. Proven track record improving system reliability, reducing downtime, and delivering successful FAT/SAT and startup activities for complex automation projects.

[TECHNICAL SKILLS]
PLC Programming & Industrial Controls: Siemens S7-1200/1500 (TIA Portal, Step 7), Allen-Bradley ControlLogix/CompactLogix (RSLogix 5000, Studio 5000), Mitsubishi GX Works, Ladder Logic, Structured Text, Function Block Diagram.
HMI & SCADA & Industrial Monitoring : Siemens WinCC (Flexible, Advanced), FactoryTalk View SE, Wonderware InTouch, Ignition SCADA, real-time dashboard development, alarm management, historian logging and data reporting.
Robotics & Vision: FANUC (ROBOGUIDE, teach pendant), ABB RobotStudio, Kawasaki programming, Cognex D905 vision camera, Keyence vision systems, OCR validation, barcode readers, vision-guided pick & place automation.
Industrial Communication & Networks : PROFINET, EtherNet/IP, Modbus TCP/RTU, OPC UA, troubleshooting network connectivity issues, device configuration, communication latency optimization.
Programming & Analytics: Python, SQL, C/C++, Data Analysis, Historian Reporting, Industrial Data Logging, Predictive Maintenance, Git, MATLAB/Simulink.
Motion Control & Drives: Variable Frequency Drives (VFDs), servo drive commissioning, pneumatic/hydraulic systems, closed-loop motion control, machine tending logic, material handling sequencing, process synchronization.
Data & IIoT: AWS IoT Core, Azure IoT Hub, MQTT, OPC UA, Data Logging & Analytics, PTC ThingWorx, Ignition Perspective.
Testing, Commissioning & Standards: Factory Acceptance Testing (FAT), Site Acceptance Testing (SAT), I/O checkout, loop testing, safety interlocks validation, IEC 61131-3, NFPA 70 electrical standards, OSHA compliance, on-site troubleshooting.

[PROFESSIONAL EXPERIENCE]
Saulsbury Industries | USA | PLC Controls Engineer | 09/2024 – Present
- Designed, programmed, and commissioned Siemens S7-1500 and Allen-Bradley ControlLogix PLC systems supporting automated material handling and conveyor operations, improving line throughput by 18%.
- Developed operator-centric WinCC HMI applications with real-time diagnostics, alarm management, and production dashboards, reducing fault response time by 40%.
- Integrated FANUC robotics and Cognex vision inspection systems with PLC-controlled manufacturing processes, improving quality validation and reducing manual inspection effort.
- Configured and optimized industrial communication networks including PROFINET, EtherNet/IP, and OPC UA for reliable data exchange across PLCs, drives, HMIs, and field devices.
- Executed FAT, SAT, I/O validation, loop checks, and commissioning activities for large-scale automation projects, achieving successful startup with zero critical deficiencies.
- Created reusable PLC function block libraries and standardized programming templates, reducing future project development effort by 30%.
- Partnered with electrical, mechanical, and operations teams to troubleshoot production issues, minimize downtime, and improve overall equipment effectiveness (OEE).

Targa Resources | USA | Controls Automation Engineer | 04/2023 – 08/2024
- Maintained and optimized PLC-based control systems for flow control, pressure regulation, and valve sequencing across midstream oil & gas operations, improving process reliability.
- Developed Ignition SCADA dashboards, alarm rationalization strategies, and historian reports, reducing alarm fatigue by 34% and improving operator response.
- Analyzed process and alarm history data using SQL and historian tools to identify recurring issues and implement targeted control logic improvements.
- Troubleshot EtherNet/IP, Modbus TCP/IP, and OPC UA communication networks, restoring system availability above 98% across distributed facilities.
- Supported commissioning, startup, FAT, and SAT activities for multiple automation upgrades, ensuring safe and successful deployment of control systems.
- Collaborated with operations, maintenance, and engineering teams to optimize control strategies, improve equipment reliability, and support predictive maintenance initiatives.

MEL Systems | India | Embedded Controls Engineer | 12/2019 – 07/2021
- Developed real-time control software in C/C++ for automotive control systems, achieving sensor-to-actuator response times below 10ms and improving system performance.
- Designed and executed validation and functional testing procedures for safety-critical control systems, contributing to successful first-pass compliance certification.
- Integrated CAN bus communication protocols and resolved timing-related issues, improving system reliability and reducing intermittent communication failures.
- Optimized control software memory utilization and processing efficiency, reducing boot time by 33% and improving CPU performance by 22%.
- Collaborated with cross-functional hardware and software teams to troubleshoot system-level issues, accelerating root-cause analysis and product release timelines.
- Established Git-based version control and code review processes, reducing integration defects by 40% and improving development quality across projects.`,
  hardhik: `[PROFESSIONAL SUMMARY]
Controls Engineer with 4+ years of experience in PLC programming, HMI/SCADA development, commissioning, and industrial automation. Expertise in Allen-Bradley, Siemens, and Delta control systems, with hands-on experience in FactoryTalk View, Ignition Perspective, WinCC, OPC UA, and Modbus TCP/IP. Skilled in FAT/SAT, industrial networking, Python automation, and control system integration. Proven ability to improve system reliability, reduce downtime, and support manufacturing operations across automotive, defense, and industrial environments.
[TECHNICAL SKILLS]
- PLC & Industrial Controls: Allen-Bradley Logix 5000, CompactLogix, Studio 5000, Siemens S7-1200/1500, Siemens TIA Portal, Delta DVP Series, WPLSoft, Beckhoff TwinCAT, IEC 61131-3 (Ladder Logic, Structured Text, Function Block Diagram).
- HMI & SCADA: FactoryTalk View, Siemens WinCC, AVEVA InTouch, Indusoft Web Studio, Ignition Vision, Ignition Perspective, Alarm Management, Historian Integration, Dashboard Development.
- Vision & Inspection Systems: Cognex D905, Cognex ViDi Suite, Keyence Vision Systems, Keyence Barcode Scanners, OCR Validation, VIN Verification, Conveyor Inspection Systems.
- Industrial Communication: OPC UA, Modbus TCP/IP, Ethernet/IP, TCP/IP, DeviceNet, Profibus, CAN Bus, PLC-HMI Integration, SCADA Networking.
- Programming & Databases: Python, C#, SQL, OSIsoft PI System, Historian Integration, Data Logging, Automation Scripting, Operational Reporting.
- Electrical Design & Commissioning: AutoCAD Electrical, Electrical Panel Testing, Wiring Diagrams, I/O Validation, FAT, SAT, CAT, System-Level Troubleshooting, Onsite Commissioning.
- Compliance & Cybersecurity: SIL, IEC 61131-3, OSHA Standards, NERC-CIP, 21 CFR Part 11, GAMP 5, ServiceNow Change Management.
- Other: Material Handling Systems, Automotive Fixture Automation, Defense Systems Integration, Switchgear & Power Distribution Systems, Industrial Engineering Automation, Process Optimization, Industrial Networking.
[PROFESSIONAL EXPERIENCE]
BW Design Group | USA | HMI/SCADA Engineer | 04/2025 - Present
- Engineered FactoryTalk View and Ignition Perspective HMIs integrated with Allen-Bradley PLCs, improving production visibility and operator efficiency by 15%.
- Configured Siemens TIA Portal, Beckhoff TwinCAT, and Studio 5000 PLC logic for robotic manufacturing and automated assembly systems.
- Implemented Cognex D905 OCR validation for VIN inspection systems, improving traceability and reducing manual verification efforts.
- Migrated legacy SCADA applications to AVEVA InTouch and Indusoft Web Studio, improving alarm management and system maintainability.
- Optimized OPC UA, TCP/IP, and Modbus networks connecting PLCs and SCADA systems, improving communication reliability.
- Established NERC-CIP compliant security controls and ServiceNow workflows, strengthening industrial cybersecurity compliance.
- Developed Ignition Perspective dashboards with centralized alarms, increasing manufacturing system uptime by 17%.
- Reduced barcode validation failures by 29% through Cognex OCR optimization and PLC-based verification logic.
- Accelerated FAT, SAT, and commissioning activities by 26% using standardized HMI templates and PLC modules.
- Created reusable PLC function blocks and programming templates, reducing development effort by 30%.
- Partnered with engineering and operations teams to resolve production issues, reducing downtime and improving overall equipment effectiveness (OEE).
BAE Systems | USA | PLC & Automation Engineer | 06/2024 – 03/2025
- Developed Siemens S7-1200/1500 and Delta DVP PLC automation systems using TIA Portal and WPLSoft, improving process sequencing accuracy and operational consistency across defense automation projects.
- Developed Siemens WinCC HMI applications for process visualization and alarm management, improving operator response efficiency by 18%.
- Produced AutoCAD Electrical schematics and panel layouts, increasing electrical design accuracy by 28% and reducing deployment errors.
- Performed FAT, SAT, I/O validation, and commissioning for PLC-based control systems, improving commissioning efficiency by 22% and ensuring successful production startup.
- Integrated analog and digital instrumentation signals into distributed PLC architectures, enhancing process stability and minimizing communication interruptions across automation environments.
- Collaborated with electrical, mechanical, and instrumentation teams to deliver standards-compliant automation solutions and successful project deployments.
TATA Motors | India | Automation & Control Systems Engineer | 11/2019 – 06/2021
- Programmed Modicon PLCs and Wonderware InTouch SCADA applications for switchgear monitoring and power distribution systems, improving operational visibility and control reliability by 20%.
- Integrated OSIsoft PI System historian infrastructure with SCADA platforms, improving historian reporting accuracy by 32% and enabling centralized asset monitoring.
- Developed Python automation scripts for SCADA synchronization and Modbus TCP/IP data acquisition, reducing manual engineering validation efforts by 33%.
- Developed C# utilities for sensor validation, operational reporting, and audit readiness processes, improving engineering productivity by 25%.
- Configured Wonderware InTouch alarm management and monitoring dashboards, reducing switchgear alarm response times by 27%.
- Supported commissioning and optimization of industrial control systems, improving system reliability by 22% and minimizing operational disruptions.`,
  mounika: `[PROFESSIONAL SUMMARY]
Controls Engineer with 4+ years of experience programming Allen-Bradley and Siemens PLCs, developing HMI/SCADA applications, and commissioning large-scale industrial automation systems. Delivered zero-deficiency FAT/SAT startups across manufacturing and process automation environments. Skilled in Ignition Perspective, FactoryTalk View, OPC UA, and Cognex vision integration.
[TECHNICAL SKILLS]
- PLC Programming & Industrial Controls: Allen-Bradley ControlLogix, CompactLogix, Studio 5000, Siemens S7-1200/1500, TIA Portal, Delta PLCs, Ladder Logic, Structured Text, Function Block Diagram.
- HMI , SCADA & Industrial Monitoring: FactoryTalk View, Ignition Perspective, Ignition Vision, Siemens WinCC, AVEVA InTouch, InduSoft Web Studio, Alarm Management, Historian Integration, Dashboard Development.
- Vision & Automation: Cognex Vision Systems, Keyence Vision Systems, OCR Validation, Barcode Verification, Conveyor Automation, Manufacturing Inspection Systems.
- Industrial Communication & Networks : PROFINET, EtherNet/IP, Modbus TCP/RTU, OPC UA, troubleshooting network connectivity issues, device configuration, communication latency optimization.
- Programming & Analytics: Python, SQL, C/C++, Data Analysis, Historian Reporting, Industrial Data Logging, Predictive Maintenance, Git, MATLAB/Simulink.
- Electrical Design & Commissioning: AutoCAD Electrical, Control Panel Design, FAT, SAT, I/O Validation, Wiring Diagrams, NEC/UL Standards.
- Testing & Standards: IEC 61131-3, OSHA Compliance, Control System Validation, Commissioning, Troubleshooting.
- Data & IIoT: MQTT, AWS IoT, OPC UA, Industrial Data Analytics, Predictive Maintenance, Ignition Perspective.
[PROFESSIONAL EXPERIENCE]
BW Design Group | Texas | PLC Controls Engineer | 11/2024 - Present
- Developed FactoryTalk View and Ignition Perspective HMI applications integrated with Allen-Bradley PLCs, improving production visibility and reducing operator response delays.
- Programmed and optimized Siemens TIA Portal and Studio 5000 PLC logic supporting automated manufacturing and robotic assembly operations.
- Integrated Cognex vision inspection and OCR validation systems with PLC-controlled production equipment, improving traceability and reducing manual verification effort.
- Configured OPC UA and Modbus TCP/IP industrial communication networks, improving system reliability and eliminating production data synchronization issues.
- Executed FAT, SAT, I/O validation, loop checks, and commissioning activities for large-scale automation projects, achieving successful startup with zero critical deficiencies.
- Collaborated with operations, maintenance, and engineering teams to improve automation performance, reduce downtime, and increase manufacturing productivity.
- Created reusable PLC function block libraries and standardized programming templates, reducing future project development effort by 30%.
- Partnered with electrical, mechanical, and operations teams to troubleshoot production issues, minimize downtime, and improve overall equipment effectiveness (OEE).
FLUOR Corporation | USA | PLC & Automation Engineer | 04/2023 – 10/2024
- Developed Siemens S7-1500 and Delta PLC control logic for industrial process automation systems, improving equipment sequencing and operational reliability.
- Designed WinCC and DOPSoft HMI applications providing real-time monitoring, alarm management, and process visualization capabilities.
- Produced AutoCAD Electrical schematics, panel layouts, and control system documentation supporting standards-compliant automation deployments.
- Conducted FAT, SAT, I/O validation, and commissioning activities, identifying and resolving automation issues prior to production startup.
- Integrated instrumentation, analog devices, and field equipment into PLC architectures, improving process stability and control system performance.
- Coordinated with instrumentation, electrical, and mechanical teams to support successful automation project execution and commissioning.
TATA Motors | India | Automation & Control Systems Engineer | 11/2019 – 06/2021
- Programmed Modicon PLCs and Wonderware InTouch SCADA systems supporting power distribution, switchgear monitoring, and industrial automation operations.
- Integrated OSIsoft PI Historian with SCADA platforms to enable centralized asset monitoring, operational reporting, and long-term performance analysis.
- Integrated CAN bus communication protocols and resolved timing-related issues, improving system reliability and reducing intermittent communication failures.
- Configured Modbus TCP/IP communication networks between PLCs, SCADA servers, and field devices, improving system reliability and operational visibility.
- Developed C# utilities for sensor validation, operational log processing, and automated reporting, supporting engineering and maintenance activities.
- Collaborated with operations and engineering teams to troubleshoot control system issues, improve alarm response, and support continuous process improvement initiatives.`
};

let PROFILES = { ...HARDCODED_PROFILES };
let DEFAULT_TEXTS = { ...HARDCODED_TEXTS };

let activeCandidate = 'pravallika';
let editingKey = null;

function getActiveProfile() {
  return PROFILES[activeCandidate];
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
      if (!HARDCODED_PROFILES[key]) {
        custom[key] = {
          profile: PROFILES[key],
          text: DEFAULT_TEXTS[key]
        };
      }
    });
    localStorage.setItem('custom_resume_profiles', JSON.stringify(custom));
  } catch (e) {
    console.error("Failed to save custom profiles", e);
  }
}

// ── SWITCH CANDIDATE ──
function switchCandidate(key) {
  if (!PROFILES[key]) return;
  activeCandidate = key;
  document.getElementById('candidate-select').value = key;
  document.getElementById('resume-text').value = DEFAULT_TEXTS[key].trim();
  
  // Show/hide edit and delete buttons based on whether it is a custom profile
  const deleteBtn = document.getElementById('delete-profile-btn');
  const editBtn = document.getElementById('edit-profile-btn');
  const isCustom = !HARDCODED_PROFILES[key];
  if (deleteBtn) {
    deleteBtn.style.display = isCustom ? 'flex' : 'none';
  }
  if (editBtn) {
    editBtn.style.display = isCustom ? 'flex' : 'none';
  }

  detectSectionsAndCompanies();
  updatePreview();
}

// ── REPOPULATE SELECT OPTIONS ──
function repopulateSelector() {
  const select = document.getElementById('candidate-select');
  if (!select) return;
  
  select.innerHTML = '';
  Object.keys(PROFILES).forEach(key => {
    const p = PROFILES[key];
    const option = document.createElement('option');
    option.value = key;
    const isCustom = !HARDCODED_PROFILES[key] ? ' [Custom]' : '';
    option.textContent = `${p.name} (${p.subtitle || 'Candidate'})${isCustom}`;
    select.appendChild(option);
  });
  
  select.value = activeCandidate;
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
  if (HARDCODED_PROFILES[activeCandidate]) {
    alert("You cannot edit default system profiles.");
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
  if (HARDCODED_PROFILES[activeCandidate]) {
    alert("You cannot delete default system profiles.");
    return;
  }
  
  if (!confirm(`Are you sure you want to delete ${PROFILES[activeCandidate].name}'s profile?`)) {
    return;
  }
  
  const targetKey = activeCandidate;
  delete PROFILES[targetKey];
  delete DEFAULT_TEXTS[targetKey];
  
  saveCustomProfiles();
  activeCandidate = 'pravallika';
  repopulateSelector();
  switchCandidate('pravallika');
}

// Active profile proxy (replaces static PROFILE references)
const PROFILE_PROXY = new Proxy({}, {
  get(target, prop) {
    const active = getActiveProfile();
    return active ? active[prop] : undefined;
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
  const mockup = document.getElementById('resume-mockup');
  if (!pane || !mockup) return;
  
  mockup.style.transform = 'none';
  mockup.style.marginBottom = '0';
  
  const paneWidth = pane.clientWidth - 32;
  const mockupWidth = mockup.offsetWidth;
  const mockupHeight = mockup.offsetHeight;
  
  if (paneWidth < mockupWidth) {
    const scale = paneWidth / mockupWidth;
    mockup.style.transform = `scale(${scale})`;
    mockup.style.transformOrigin = 'top center';
    const heightReduction = mockupHeight * (1 - scale);
    mockup.style.marginBottom = `-${heightReduction}px`;
  }
}
window.addEventListener('resize', adjustPreviewScale);


// ── SCALE PREVIEW TO FIT VIEWPORT ──

window.addEventListener('resize', adjustPreviewScale);

// ── PREVIEW BUILDER ──

// ── SCALE PREVIEW TO FIT VIEWPORT ──

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

// -- PDF DOWNLOAD VIA BROWSER PRINT --
document.getElementById('pdf-btn').onclick = () => {
  const rawText = document.getElementById('resume-text').value.trim();
  if (!rawText) {
    alert('Please paste your resume content into the text box first!');
    return;
  }
  
  // A slight delay to ensure UI updates before printing
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

// Populate company copy buttons and preview on load
window.addEventListener('DOMContentLoaded', () => {
  loadCustomProfiles();
  repopulateSelector();
  switchCandidate(activeCandidate);
});