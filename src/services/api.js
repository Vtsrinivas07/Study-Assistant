import { parseAndValidateWorkspaceData } from './schemaValidator';

let activeAbortController = null;
let currentRequestId = 0;

const SYSTEM_PROMPT = `
You are Study Assistant AI, an elite learning space architect and computer science tutor. The user will upload study notes or a learning topic.
Respond strictly with valid JSON without any markdown code block wrappers or backticks around it.

CRITICAL MANDATES:
1. "flashcards" array MUST contain AT LEAST 5 unique flashcard items.
2. "quiz" array MUST contain AT LEAST 10 unique multiple-choice quiz questions ("quiz bits").

The output MUST adhere strictly to the following JSON structure:

{
  "sessionId": "sess_ai_99",
  "topic": "Topic Title",
  "category": "Domain / Field",
  "progressPct": 45,
  "estimatedStudyTimeMins": 25,
  "statsSummary": {
    "conceptsCount": 14,
    "flashcardsCount": 5,
    "quizQuestionsCount": 10,
    "weakAreasCount": 3
  },
  "prerequisites": ["Prereq 1", "Prereq 2"],
  "conceptNodes": [
    {
      "id": "node_1",
      "label": "Main Topic Overview",
      "parent": null,
      "level": 0,
      "status": "mastered",
      "desc": "Core overview"
    }
  ],
  "flashcards": [
    { "id": "card_1", "concept": "Concept 1", "question": "Question 1?", "answer": "Answer explanation 1.", "difficulty": "Medium", "category": "Core" },
    { "id": "card_2", "concept": "Concept 2", "question": "Question 2?", "answer": "Answer explanation 2.", "difficulty": "Medium", "category": "Core" },
    { "id": "card_3", "concept": "Concept 3", "question": "Question 3?", "answer": "Answer explanation 3.", "difficulty": "Hard", "category": "Advanced" },
    { "id": "card_4", "concept": "Concept 4", "question": "Question 4?", "answer": "Answer explanation 4.", "difficulty": "Easy", "category": "Basic" },
    { "id": "card_5", "concept": "Concept 5", "question": "Question 5?", "answer": "Answer explanation 5.", "difficulty": "Medium", "category": "Core" }
  ],
  "quiz": [
    { "id": "q_1", "question": "Question 1?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 0, "explanation": "Explanation 1." },
    { "id": "q_2", "question": "Question 2?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 1, "explanation": "Explanation 2." },
    { "id": "q_3", "question": "Question 3?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 2, "explanation": "Explanation 3." },
    { "id": "q_4", "question": "Question 4?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 0, "explanation": "Explanation 4." },
    { "id": "q_5", "question": "Question 5?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 3, "explanation": "Explanation 5." },
    { "id": "q_6", "question": "Question 6?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 1, "explanation": "Explanation 6." },
    { "id": "q_7", "question": "Question 7?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 2, "explanation": "Explanation 7." },
    { "id": "q_8", "question": "Question 8?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 0, "explanation": "Explanation 8." },
    { "id": "q_9", "question": "Question 9?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 1, "explanation": "Explanation 9." },
    { "id": "q_10", "question": "Question 10?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 3, "explanation": "Explanation 10." }
  ]
}
`;

function getApiKey() {
  return (
    import.meta.env.VITE_GROQ_API_KEY ||
    import.meta.env.GROQ_API_KEY ||
    (typeof process !== 'undefined' && process.env && process.env.GROQ_API_KEY) ||
    ''
  ).trim();
}

export async function analyzeStudyNotes(notesText, options = {}) {
  const { simulateError, timeoutMs = 20000 } = options;

  if (activeAbortController) activeAbortController.abort();
  activeAbortController = new AbortController();
  const signal = activeAbortController.signal;
  const requestId = ++currentRequestId;

  const timeoutId = setTimeout(() => {
    if (activeAbortController) activeAbortController.abort();
  }, timeoutMs);

  try {
    // 1. Handle error simulation scenarios
    if (simulateError) {
      if (simulateError === 'malformed') {
        const parseResult = parseAndValidateWorkspaceData('{"topic": "Broken Session", "conceptNodes": [{"label": "Unclosed string...');
        return { success: true, requestId, ...parseResult };
      }
      if (simulateError === 'schema_mismatch') {
        const parseResult = parseAndValidateWorkspaceData(JSON.stringify({ wrong_key: "Invalid data shape" }));
        return { success: true, requestId, ...parseResult };
      }
      if (simulateError === 'empty') {
        const parseResult = parseAndValidateWorkspaceData('');
        return { success: true, requestId, ...parseResult };
      }
      if (simulateError === 'timeout') {
        await new Promise(r => setTimeout(r, 16000));
      }
    }

    // 2. Try calling backend server route if available
    let rawText = '';
    try {
      const serverRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notesText, simulateError }),
        signal,
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        rawText = data.rawText;
      }
    } catch (e) {
      // Backend route not available, will fallback to direct Groq API call below
    }

    // 3. Direct Groq API Call from frontend if backend route is unavailable
    if (!rawText) {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('Groq API Key is missing. Please set VITE_GROQ_API_KEY or GROQ_API_KEY in Environment Variables.');
      }

      const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
      let lastError = null;

      for (const model of models) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Generate a study workspace with AT LEAST 5 flashcards and AT LEAST 10 quiz questions for: ${notesText}` }
              ],
              temperature: 0.3,
              max_tokens: 4096,
              response_format: { type: "json_object" }
            }),
            signal
          });

          if (response.ok) {
            const data = await response.json();
            rawText = data.choices?.[0]?.message?.content;
            if (rawText) break;
          } else {
            const errText = await response.text();
            lastError = new Error(`Groq API (${response.status}): ${errText}`);
          }
        } catch (err) {
          lastError = err;
        }
      }

      if (!rawText) {
        throw new Error(lastError?.message || 'Failed to generate study workspace from Groq AI.');
      }
    }

    clearTimeout(timeoutId);
    if (requestId !== currentRequestId) throw new Error('STALE_REQUEST_CANCELLED');

    const parseResult = parseAndValidateWorkspaceData(rawText);
    return { success: true, requestId, ...parseResult };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      if (requestId !== currentRequestId) throw new Error('STALE_REQUEST_CANCELLED');
      throw new Error('Study analysis timed out after 20 seconds.');
    }
    throw err;
  } finally {
    if (requestId === currentRequestId) activeAbortController = null;
  }
}
