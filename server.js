require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = ['http://localhost:8000', 'https://professional.cvcraft.workers.dev', 'https://janakirao4701.github.io'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  }
}));
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

const scoreLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: { error: 'Too many analysis requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/ats-score', scoreLimiter, async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !resumeText.trim()) {
    return res.status(400).json({ error: 'Resume text is required.' });
  }

  const targetJD = (jobDescription && jobDescription.trim()) 
    ? jobDescription.trim() 
    : "Evaluate overall general resume strength, readability, formatting, and structural quality without a specific target job description.";

  const systemPrompt = require('./resume_prompts/ats_system_prompt.json').prompt;

  const todayDate = new Date().toISOString().split('T')[0];
  const userPrompt = `### TODAY'S DATE: ${todayDate}

### JOB DESCRIPTION:
${targetJD}

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
