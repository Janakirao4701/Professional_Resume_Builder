const CACHE_NAME = 'resume-builder-v1';
const ASSETS = [
  '/',
  '/builder.html',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/js/state.js',
  '/js/parser.js',
  '/js/preview.js',
  '/js/ui.js',
  '/js/docx.js',
  '/js/pdf.js',
  '/js/ats.js',
  '/js/prompts.js',
  '/resume_prompts/software_engineer_prompt.md',
  '/resume_prompts/python_developer_prompt.md',
  '/resume_prompts/java_developer_prompt.md',
  '/resume_prompts/dotnet_developer_prompt.md',
  '/resume_prompts/devops_engineer_prompt.md',
  '/resume_prompts/data_engineer_prompt.md',
  '/resume_prompts/data_analyst_prompt.md',
  '/resume_prompts/business_analyst_prompt.md',
  '/resume_prompts/automation_engineer_prompt.md',
  '/resume_prompts/controls_engineer_prompt.md',
  '/resume_prompts/plc_controls_engineer_prompt.md',
  '/resume_prompts/universal_resume_prompt.md'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Avoid failing installation if some assets are not found immediately (e.g. root route in local node)
      return Promise.allSettled(
        ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`[PWA] Failed to cache: ${asset}`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Do not cache API score requests
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for document navigation when offline
        if (e.request.mode === 'navigate') {
          return caches.match('/builder.html');
        }
      });
    })
  );
});
