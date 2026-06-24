import promptData from './resume_prompts/ats_system_prompt.json';

// Cloudflare Worker Entrypoint - Trigger redeploy
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route API requests to our handler
    if (url.pathname === '/api/ats-score' && request.method === 'POST') {
      try {
        const { resumeText, jobDescription } = await request.json();

        if (!resumeText || !resumeText.trim()) {
          return new Response(JSON.stringify({ error: 'Resume text is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const targetJD = (jobDescription && jobDescription.trim()) 
          ? jobDescription.trim() 
          : "Evaluate overall general resume strength, readability, formatting, and structural quality without a specific target job description.";

        const apiKey = env.OPENROUTER_API_KEY || env['OPENROUTER API KEY'] || globalThis.OPENROUTER_API_KEY || globalThis['OPENROUTER API KEY'] || '';
        const model = env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

        if (!apiKey) {
          return new Response(JSON.stringify({ error: 'Missing OpenRouter API key. Please configure OPENROUTER_API_KEY in Cloudflare Worker settings.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
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
          const errText = await response.text();
          return new Response(JSON.stringify({ error: `OpenRouter API Error: ${response.status} - ${errText}` }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const data = await response.json();
        let content = data.choices[0].message.content.trim();

        if (content.startsWith('```')) {
          content = content.replace(/^```(?:json)?\s*/i, '').replace(/```$/s, '').trim();
        }

        JSON.parse(content);

        return new Response(content, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

      } catch (err) {
        console.error('[Worker Error]', err);
        return new Response(JSON.stringify({ error: 'Failed to evaluate resume. Please try again.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static assets using ASSETS binding
    return env.ASSETS.fetch(request);
  }
};
