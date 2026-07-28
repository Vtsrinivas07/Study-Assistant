import { generateStudyWorkspaceFromAI } from '../server/aiService.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { notesText, simulateError } = req.body || {};

    if (!notesText || !notesText.trim()) {
      return res.status(400).json({ error: 'Study notes or topic input text is required.' });
    }

    const rawText = await generateStudyWorkspaceFromAI(notesText, { simulateError });
    return res.status(200).json({ rawText });
  } catch (error) {
    console.error('Serverless Error analyzing study notes:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
