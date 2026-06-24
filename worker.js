import promptData from './resume_prompts/ats_system_prompt.json';

// In-memory rate limiting sliding window (per-isolate cache)
const ipHits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_HITS = 5; // Max 5 requests per minute

function isRateLimited(ip) {
  const now = Date.now();
  if (!ipHits.has(ip)) {
    ipHits.set(ip, [now]);
    return false;
  }
  let hits = ipHits.get(ip).filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  if (hits.length >= MAX_HITS) {
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Allowed Origins List
    const allowedOrigins = [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'https://professional.cvcraft.workers.dev',
      'https://janakirao4701.github.io'
    ];

    const origin = request.headers.get('Origin');
    const isAllowedOrigin = allowedOrigins.includes(origin);
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'https://janakirao4701.github.io',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Route API requests to our handler
    if (url.pathname === '/api/ats-score') {
      // Handle Pre-flight options request
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders
        });
      }

      if (request.method === 'POST') {
        try {
          // 1. Rate Limiting Check
          const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
          if (isRateLimited(clientIp)) {
            return new Response(JSON.stringify({ error: 'Too many analysis requests. Please wait a minute and try again.' }), {
              status: 429,
              headers: corsHeaders
            });
          }

          // 2. Parse Body
          const { resumeText, jobDescription } = await request.json();

          if (!resumeText || !resumeText.trim()) {
            return new Response(JSON.stringify({ error: 'Resume text is required.' }), {
              status: 400,
              headers: corsHeaders
            });
          }

          const targetJD = (jobDescription && jobDescription.trim()) 
            ? jobDescription.trim() 
            : "Evaluate overall general resume strength, readability, formatting, and structural quality without a specific target job description.";

          const apiKey = env.OPENROUTER_API_KEY || env['OPENROUTER API KEY'] || globalThis.OPENROUTER_API_KEY || globalThis['OPENROUTER API KEY'] || '';
          const model = env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

          if (!apiKey) {
            console.error('[Worker Configuration Error] Missing OpenRouter API key.');
            return new Response(JSON.stringify({ error: 'Failed to evaluate resume. API configuration error.' }), {
              status: 500,
              headers: corsHeaders
            });
          }

          const systemPrompt = promptData.prompt;
          const todayDate = new Date().toISOString().split('T')[0];
          const userPrompt = `### TODAY'S DATE: ${todayDate}

### JOB DESCRIPTION:
${targetJD}

### RESUME CONTENT:
${resumeText}`;

          let retries = 3;
          let delay = 1000;
          let response;

          for (let i = 0; i < retries; i++) {
            response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': request.url,
                'X-Title': 'Professional Resume Builder'
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.1,
                max_tokens: 4096,
                response_format: { type: 'json_object' }
              })
            });

            if (response.status === 429 && i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2;
            } else {
              break;
            }
          }

          if (!response.ok) {
            console.error(`[Worker API Error] OpenRouter status: ${response.status}`);
            return new Response(JSON.stringify({ error: 'Failed to evaluate resume. Please try again.' }), {
              status: 500,
              headers: corsHeaders
            });
          }

          const data = await response.json();
          let content = data.choices[0].message.content.trim();

          if (content.startsWith('```')) {
            content = content.replace(/^```(?:json)?\s*/i, '').replace(/```$/s, '').trim();
          }

          // Validate JSON syntax before returning
          JSON.parse(content);

          return new Response(content, {
            status: 200,
            headers: corsHeaders
          });

        } catch (err) {
          console.error('[Worker Exception]', err);
          return new Response(JSON.stringify({ error: 'Failed to evaluate resume. Please try again.' }), {
            status: 500,
            headers: corsHeaders
          });
        }
      }

      // Method not allowed on /api/ats-score
      return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
        status: 405,
        headers: corsHeaders
      });
    }

    // Serve static assets using ASSETS binding
    return env.ASSETS.fetch(request);
  }
};
