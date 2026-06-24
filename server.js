require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Initialize OpenAI SDK client configured for OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || ''
});

// Helper for calling OpenRouter with exponential backoff on 429 rate limits
async function callOpenRouterWithRetry(payload, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await openai.chat.completions.create(payload);
      return response;
    } catch (err) {
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
      if (isRateLimit && i < retries - 1) {
        console.warn(`[OpenRouter] Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
}

app.post('/api/ats-score', async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !resumeText.trim()) {
    return res.status(400).json({ error: 'Resume text is required.' });
  }
  if (!jobDescription || !jobDescription.trim()) {
    return res.status(400).json({ error: 'Job description text is required.' });
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

  try {
    const response = await callOpenRouterWithRetry({
      model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    let content = response.choices[0].message.content.trim();

    // Strip markdown JSON fences if returned by the LLM
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*/i, '').replace(/```$/s, '').trim();
    }

    const parsedJson = JSON.parse(content);
    res.json(parsedJson);
  } catch (err) {
    console.error('[API Error]', err);
    res.status(500).json({ error: 'Failed to evaluate resume. Please check your OpenRouter API key and try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Resume Builder Server running at http://localhost:${PORT}`);
});
