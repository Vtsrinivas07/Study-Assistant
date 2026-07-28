import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function getGroqKey() {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    return process.env.GROQ_API_KEY.trim();
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath));
      if (parsed.GROQ_API_KEY) return parsed.GROQ_API_KEY.trim();
    }
  } catch (e) {}
  return '';
}

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
    },
    {
      "id": "node_2",
      "label": "Sub-concept A",
      "parent": "node_1",
      "level": 1,
      "status": "weak",
      "desc": "Key details"
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
  ],
  "weakTopics": [
    { "id": "weak_1", "title": "Weak Area 1", "reason": "Requires review based on notes", "estMins": 5 }
  ],
  "revisionPlan": [
    { "step": 1, "title": "Actionable Revision Step 1", "time": "5 mins", "action": "Flashcard Drill" },
    { "step": 2, "title": "Actionable Revision Step 2", "time": "6 mins", "action": "Quiz Drill" }
  ]
}
`;

export async function generateStudyWorkspaceFromAI(notesText, options = {}) {
  const { simulateError } = options;

  if (simulateError) {
    if (simulateError === 'malformed') return `{"topic": "Broken Session", "conceptNodes": [{"label": "Unclosed string...`;
    if (simulateError === 'schema_mismatch') return JSON.stringify({ wrong_key: "Invalid data shape" });
    if (simulateError === 'empty') return '';
    if (simulateError === 'timeout') {
      await new Promise(r => setTimeout(r, 16000));
      return JSON.stringify({ topic: "Timeout Workspace" });
    }
  }

  const apiKey = getGroqKey();
  if (!apiKey) {
    throw new Error('Groq API Key is missing. Please set GROQ_API_KEY in your .env file.');
  }

  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`🧠 Study Assistant AI analyzing notes via Groq (${model}): "${notesText.slice(0, 50)}..."`);
      
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
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`⚠️ Groq model ${model} failed (${response.status}): ${errText}`);
        lastError = new Error(`Groq API error (${response.status}): ${errText}`);
        continue;
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) {
        console.warn(`⚠️ Groq model ${model} returned empty choice content.`);
        lastError = new Error(`Model ${model} returned empty content.`);
        continue;
      }

      console.log(`✅ Study Assistant Workspace generated via Groq (${model})!`);
      return rawContent;
    } catch (err) {
      console.warn(`⚠️ Network/Fetch error on Groq model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`All Groq AI models failed. ${lastError?.message || 'Rate limit or network error.'}`);
}
