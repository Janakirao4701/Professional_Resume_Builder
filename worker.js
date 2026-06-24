// Cloudflare Worker Entrypoint - Trigger redeploy
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Debug route to see available keys in env
    if (url.pathname === '/api/test-env') {
      return new Response(JSON.stringify({ keys: Object.keys(env) }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
        if (!jobDescription || !jobDescription.trim()) {
          return new Response(JSON.stringify({ error: 'Job description text is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const apiKey = env.OPENROUTER_API_KEY || env['OPENROUTER API KEY'] || '';
        const model = env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

        if (!apiKey) {
          return new Response(JSON.stringify({ error: 'Missing OpenRouter API key. Please configure OPENROUTER_API_KEY in Cloudflare Worker settings.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const systemPrompt = `You are a professional ATS (Applicant Tracking System) Evaluation Engine and senior technical recruiter.
Your task is to analyze the provided Resume and Job Description (JD) to calculate compatibility scores and match metrics.
Evaluate the candidate across all industries without assuming a specific profession.

SCORING CRITERIA:
1. ATS Score (Weight: 40%)
   - Keyword Relevance (60 pts): Extract Critical keywords (mandatory skills in JD), Important keywords (frequent skill terms in JD), and Preferred keywords (nice-to-haves). Match them against the resume using flexible matches (e.g., C++ should match C++). Deduct 5 pts per missing Critical keyword (max -20 penalty).
   - Section Structure (10 pts): Check completeness (Professional Summary, Skills, Experience, Education).
   - Date Consistency (5 pts): Check if dates use a consistent format.
   - ATS Formatting (10 pts): Warn if tables (column dividers like '|'), tab columns, or HTML formatting tags exist.
   - Experience Alignment (10 pts): Compare candidate YOE to JD target YOE.
   - Education Alignment (5 pts): Compare degree level requirements.
2. Recruiter Score (Weight: 35%)
   - Summary Quality (20 pts): Verify target title, years of experience, core expertise, and business value statements.
   - Experience Quality (35 pts): Verify action verbs, task contexts, and measurable business outcomes.
   - Quantification (15 pts): Check density of metrics (percentages, cost/time saved).
   - Progression (15 pts): Verify career progression and leadership/responsibility growth.
   - Readability (15 pts): Check bullet lengths and formatting.
3. Technical / Domain Score (Weight: 25%)
   - Tool Specificity (25 pts): Scan for specific tools, platforms, or products vs generic descriptors.
   - Skill Depth (20 pts): Count distinct skills and certifications listed.
   - Industry Alignment (25 pts): Check percentage of JD keywords that appear in the resume.
   - Achievement Credibility (20 pts): Deduct points for unrealistic claims (like "100% efficiency") or round percentages without context.
   - Ownership Signals (10 pts): Scan for ownership verbs (led, owned, designed, implemented, managed, architected).

OVERALL COMPOSITE SCORE:
Calculate the overall score as: Overall = Math.round((ATS * 0.40) + (Recruiter * 0.35) + (Technical * 0.25)).

OUTPUT SCHEMA:
Return ONLY a raw, valid JSON object with the following schema. Do not enclose it in markdown code blocks, and do not output any other text:
{
  "overall": number,
  "ats": number,
  "recruiter": number,
  "technical": number,
  "matchLevel": "Excellent" | "Strong" | "Moderate" | "Weak",
  "criticalMatched": string[],
  "criticalMissing": string[],
  "importantMatched": string[],
  "importantMissing": string[],
  "preferredMatched": string[],
  "preferredMissing": string[],
  "strengths": string[],
  "weaknesses": string[]
}

Make the strengths and weaknesses descriptive and actionable (e.g. "ATS: Spelled out acronyms...", "Recruiter: Quantify older roles...").`;

        const userPrompt = `### JOB DESCRIPTION:
${jobDescription}

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
        return new Response(JSON.stringify({ error: `Failed to evaluate resume: ${err.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static assets using ASSETS binding
    return env.ASSETS.fetch(request);
  }
};
