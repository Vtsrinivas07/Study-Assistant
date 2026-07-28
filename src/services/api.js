import { parseAndValidateWorkspaceData } from './schemaValidator';

let activeAbortController = null;
let currentRequestId = 0;

export async function analyzeStudyNotes(notesText, options = {}) {
  const { simulateError, timeoutMs = 15000 } = options;

  if (activeAbortController) activeAbortController.abort();
  activeAbortController = new AbortController();
  const signal = activeAbortController.signal;
  const requestId = ++currentRequestId;

  const timeoutId = setTimeout(() => {
    if (activeAbortController) activeAbortController.abort();
  }, timeoutMs);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notesText, simulateError }),
      signal,
    });

    clearTimeout(timeoutId);
    if (requestId !== currentRequestId) throw new Error('STALE_REQUEST_CANCELLED');
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}: Failed to analyze study notes.`);
    }

    const data = await response.json();
    const parseResult = parseAndValidateWorkspaceData(data.rawText);

    return { success: true, requestId, ...parseResult };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      if (requestId !== currentRequestId) throw new Error('STALE_REQUEST_CANCELLED');
      throw new Error('Study analysis timed out after 15 seconds.');
    }
    throw err;
  } finally {
    if (requestId === currentRequestId) activeAbortController = null;
  }
}
