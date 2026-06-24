// ── STATE STORE & PROXY MANAGER ──

export const DEFAULT_PROFILE_DATA = {
  profile: {
    name:     'John Doe',
    subtitle: 'Professional Title',
    email:    'john.doe@email.com',
    phone:    '+1 (123) 456-7890',
    location: 'City, Country',
    linkedin: 'linkedin.com/in/johndoe',
    education: [
      { degree: 'Degree Name', dates: 'Start – End Date', school: 'University/Institution Name', location: 'Location' }
    ],
    certs: []
  },
  text: `[PROFESSIONAL SUMMARY]
A brief summary of your professional background, key expertise, and accomplishments.

[TECHNICAL SKILLS]
Core Competencies: Skill 1, Skill 2, Skill 3, Skill 4.
Tools & Technologies: Tool A, Tool B, Tool C, Tool D.

[PROFESSIONAL EXPERIENCE]
Company Name | Location | Job Title | Dates
- Developed and deployed key systems, improving efficiency by 20%
- Collaborated with cross-functional teams to deliver high-quality projects`
};

export const GUIDED_ONBOARDING_TEMPLATE = `[PROFESSIONAL SUMMARY]
Senior Software Engineer with 8+ years of experience leading cross-functional teams and designing distributed cloud architectures. Expert in Python and cloud systems with a proven track record of reducing latency and optimizing API performance.

[TECHNICAL SKILLS]
Programming Languages: Python, Go, JavaScript, SQL, C++
Cloud & DevOps: GCP, AWS, Docker, Kubernetes, CI/CD Pipelines
Databases: PostgreSQL, Redis, Elasticsearch, DynamoDB

[PROFESSIONAL EXPERIENCE]
TechCorp Solutions | San Francisco, CA | Lead Software Engineer | 04/2022 - Present
- Architected a real-time event streaming pipeline using Go and Redis, reducing data latency by 35%
- Led a team of 4 engineers to rebuild the legacy core billing system, improving API reliability to 99.99%
- Mentored junior developers and instituted code review standards across the backend engineering group

Innovate Labs | Seattle, WA | Senior Backend Developer | 08/2018 - 03/2022
- Developed high-throughput REST APIs using Python and FastAPI, serving over 10M daily active requests
- Migrated legacy database schemas to PostgreSQL with optimized indexing, reducing query runtimes by 50%
- Automated testing workflows with pytest, boosting unit test coverage from 60% to 92%
`;

export let profiles = {};
export let currentProfileId = 'default';

// Notify callbacks of state changes (e.g. for re-rendering UI)
const stateListeners = [];
export function subscribeToState(callback) {
  stateListeners.push(callback);
}
function notifyStateChanged() {
  stateListeners.forEach(cb => cb());
}

// State Proxy representing the active profile dynamically. 
// Closures holding activeProfile will never get stale references.
export const activeProfile = new Proxy({}, {
  get(target, prop) {
    if (prop === 'id') return currentProfileId;
    if (prop === 'text') return profiles[currentProfileId]?.text || '';
    if (prop === 'ats_results') return profiles[currentProfileId]?.ats_results || null;
    if (prop === 'score_history') return profiles[currentProfileId]?.score_history || [];
    return profiles[currentProfileId]?.profile?.[prop];
  },
  set(target, prop, value) {
    if (!profiles[currentProfileId]) return false;
    if (prop === 'text') {
      profiles[currentProfileId].text = value;
    } else if (prop === 'ats_results') {
      profiles[currentProfileId].ats_results = value;
    } else if (prop === 'score_history') {
      profiles[currentProfileId].score_history = value;
    } else {
      if (!profiles[currentProfileId].profile) profiles[currentProfileId].profile = {};
      profiles[currentProfileId].profile[prop] = value;
    }
    saveToStorage();
    notifyStateChanged();
    return true;
  }
});

let saveToStorageTimeout = null;
export function saveToStorage() {
  clearTimeout(saveToStorageTimeout);
  saveToStorageTimeout = setTimeout(() => {
    saveToStorageImmediate();
  }, 500); // 500ms debounce
}

export function saveToStorageImmediate() {
  clearTimeout(saveToStorageTimeout);
  try {
    localStorage.setItem('resume_builder_profiles', JSON.stringify(profiles));
    localStorage.setItem('resume_builder_current_profile_id', currentProfileId);
  } catch (e) {
    console.error('[Storage Error] Failed to write profiles to localStorage:', e);
    if (typeof window.showToast === 'function') {
      window.showToast("Storage Error: Local storage is full. Changes may not be saved.");
    }
  }
}

// Flush state immediately on page unload
window.addEventListener('beforeunload', () => {
  saveToStorageImmediate();
});

export function upgradeAllProfiles() {
  if (!profiles || typeof profiles !== 'object') {
    profiles = { default: JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA)) };
  }
  Object.keys(profiles).forEach(id => {
    let p = profiles[id];
    if (!p || typeof p !== 'object') {
      profiles[id] = { profile: {}, text: '' };
      p = profiles[id];
    }
    if (!p.profile || typeof p.profile !== 'object') {
      p.profile = {};
    }
    if (!p.profile.education || !Array.isArray(p.profile.education)) {
      p.profile.education = [];
    } else {
      p.profile.education = p.profile.education.filter(e => e && typeof e === 'object').map(e => ({
        degree: typeof e.degree === 'string' ? e.degree : '',
        school: typeof e.school === 'string' ? e.school : '',
        dates: typeof e.dates === 'string' ? e.dates : '',
        location: typeof e.location === 'string' ? e.location : ''
      }));
    }
    if (!p.profile.certs || !Array.isArray(p.profile.certs)) {
      p.profile.certs = [];
    } else {
      p.profile.certs = p.profile.certs.filter(c => c !== null && c !== undefined).map(c => String(c));
    }
    if (!p.score_history || !Array.isArray(p.score_history)) {
      p.score_history = [];
    }
    
    // Migrate profiles to tagless format
    const rawText = p.text || '';
    const hasSummaryTag = rawText.includes('[SUMMARY]') || rawText.includes('[PROFESSIONAL SUMMARY]');
    const hasSkillsTag = rawText.includes('[SKILLS]') || rawText.includes('[TECHNICAL SKILLS]');
    
    if (!hasSummaryTag && !hasSkillsTag && (p.profile.summary || p.profile.skills)) {
      let newText = "";
      if (p.profile.summary) {
        newText += `[PROFESSIONAL SUMMARY]\n${p.profile.summary.trim()}\n\n`;
      }
      if (p.profile.skills) {
        newText += `[TECHNICAL SKILLS]\n${p.profile.skills.trim()}\n\n`;
      }
      if (rawText) {
        if (rawText.includes('[EXPERIENCE]') || rawText.includes('[PROFESSIONAL EXPERIENCE]')) {
          newText += rawText.trim();
        } else {
          newText += `[PROFESSIONAL EXPERIENCE]\n${rawText.trim()}`;
        }
      }
      p.text = newText;
      delete p.profile.summary;
      delete p.profile.skills;
    }
  });
}

export function initProfiles() {
  const stored = localStorage.getItem('resume_builder_profiles');
  const storedId = localStorage.getItem('resume_builder_current_profile_id');
  
  if (stored) {
    try {
      profiles = JSON.parse(stored);
    } catch(e) {
      console.error("Failed to parse profiles from localStorage, using default.");
      profiles = { default: JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA)) };
    }
  } else {
    profiles = { default: JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA)) };
  }
  
  if (!profiles || typeof profiles !== 'object' || Object.keys(profiles).length === 0) {
    profiles = { default: JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA)) };
  }
  
  upgradeAllProfiles();
  
  if (storedId && profiles[storedId]) {
    currentProfileId = storedId;
  } else {
    currentProfileId = Object.keys(profiles)[0] || 'default';
  }
  
  if (!profiles[currentProfileId]) {
    currentProfileId = Object.keys(profiles)[0] || 'default';
  }
  
  if (!profiles[currentProfileId]) {
    profiles[currentProfileId] = JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA));
  }
}

export function setProfiles(newProfiles) {
  profiles = newProfiles;
  saveToStorageImmediate();
  notifyStateChanged();
}

export function setCurrentProfileId(id) {
  currentProfileId = id;
  saveToStorageImmediate();
  notifyStateChanged();
}
