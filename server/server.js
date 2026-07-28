import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateStudyWorkspaceFromAI } from './aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Study Assistant — The AI Learning Workspace',
    mode: process.env.GROQ_API_KEY ? 'groq (llama-3.3-70b-versatile)' : 'mock-fallback',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { notesText, simulateError } = req.body;
    if (!notesText && !simulateError) return res.status(400).json({ error: 'Study notes or topic input is required.' });
    const rawResponse = await generateStudyWorkspaceFromAI(notesText || '', { simulateError });
    res.json({ rawText: rawResponse });
  } catch (error) {
    console.error('Error analyzing study notes:', error);
    res.status(500).json({ error: error.message || 'Internal server error during study analysis.' });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 Study Assistant AI Learning Workspace Backend running on http://localhost:${PORT}`);
  console.log(`ℹ️ Mode: ${process.env.GROQ_API_KEY ? 'Groq API Key active' : 'Mock AI Engine active'}`);
});
