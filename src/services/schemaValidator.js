import { z } from 'zod';

export const ConceptNodeSchema = z.object({
  id: z.string().default(() => `node_${Math.random().toString(36).substring(2, 9)}`),
  label: z.string().default('Concept'),
  parent: z.string().nullable().default(null),
  level: z.number().default(0),
  status: z.string().default('mastered'),
  desc: z.string().default('Core concept explanation.')
});

export const FlashcardSchema = z.object({
  id: z.string().default(() => `card_${Math.random().toString(36).substring(2, 9)}`),
  concept: z.string().default('General Concept'),
  question: z.string().default('Concept review question?'),
  answer: z.string().default('Detailed answer explanation.'),
  difficulty: z.string().default('Medium'),
  category: z.string().default('General')
});

export const QuizQuestionSchema = z.object({
  id: z.string().default(() => `q_${Math.random().toString(36).substring(2, 9)}`),
  question: z.string().default('Quiz Question?'),
  options: z.array(z.string()).default(['Option A', 'Option B', 'Option C', 'Option D']),
  correctIndex: z.number().default(0),
  explanation: z.string().default('Detailed answer explanation.')
});

export const WeakTopicSchema = z.object({
  id: z.string().default(() => `weak_${Math.random().toString(36).substring(2, 9)}`),
  title: z.string().default('Weak Concept Area'),
  reason: z.string().default('Requires additional review.'),
  estMins: z.number().default(5)
});

export const RevisionStepSchema = z.object({
  step: z.number().default(1),
  title: z.string().default('Revision Drill'),
  time: z.string().default('5 mins'),
  action: z.string().default('Flashcard Review')
});

export const WorkspaceSchema = z.object({
  sessionId: z.string().default(() => `sess_${Date.now()}`),
  topic: z.string().default('Machine Learning & Neural Networks'),
  category: z.string().default('Computer Science'),
  progressPct: z.number().default(72),
  estimatedStudyTimeMins: z.number().default(28),
  statsSummary: z.object({
    conceptsCount: z.number().default(18),
    flashcardsCount: z.number().default(5),
    quizQuestionsCount: z.number().default(10),
    weakAreasCount: z.number().default(4)
  }).default({ conceptsCount: 18, flashcardsCount: 5, quizQuestionsCount: 10, weakAreasCount: 4 }),
  prerequisites: z.array(z.string()).default(['Linear Algebra', 'Python']),
  conceptNodes: z.array(ConceptNodeSchema).default([]),
  flashcards: z.array(FlashcardSchema).default([]),
  quiz: z.array(QuizQuestionSchema).default([]),
  weakTopics: z.array(WeakTopicSchema).default([]),
  revisionPlan: z.array(RevisionStepSchema).default([])
});

export function sanitizeControlCharacters(jsonStr) {
  if (!jsonStr) return '';
  let inString = false;
  let result = '';

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    const prevChar = i > 0 ? jsonStr[i - 1] : '';

    if (char === '"' && prevChar !== '\\') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else if (char === '\b') {
        result += '\\b';
      } else if (char === '\f') {
        result += '\\f';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }

  return result;
}

export function cleanRawJsonText(rawText) {
  if (!rawText) return '';
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

export function attemptHeuristicRepair(jsonStr) {
  let repaired = jsonStr.trim();

  let openBraces = (repaired.match(/\{/g) || []).length;
  let closeBraces = (repaired.match(/\}/g) || []).length;
  let openBrackets = (repaired.match(/\[/g) || []).length;
  let closeBrackets = (repaired.match(/\]/g) || []).length;

  let quotes = (repaired.match(/"/g) || []).length;
  if (quotes % 2 !== 0) {
    repaired += '"';
  }

  repaired = repaired.replace(/,\s*([\}\]])/g, '$1');

  while (openBrackets > closeBrackets) {
    repaired += ']';
    closeBrackets++;
  }
  while (openBraces > closeBraces) {
    repaired += '}';
    closeBraces++;
  }

  return repaired;
}

export function parseAndValidateWorkspace(rawText) {
  const diagnostics = {
    stepsAttempted: [],
    sanitizationsApplied: [],
    zodValidationPassed: false
  };

  if (!rawText || !rawText.trim()) {
    throw new Error("EMPTY_PAYLOAD: Received empty string response from server.");
  }

  diagnostics.stepsAttempted.push("1_strip_markdown_fences");
  let jsonString = cleanRawJsonText(rawText);

  diagnostics.stepsAttempted.push("2_sanitize_control_characters");
  jsonString = sanitizeControlCharacters(jsonString);

  let parsedObj = null;

  try {
    diagnostics.stepsAttempted.push("3_standard_json_parse");
    parsedObj = JSON.parse(jsonString);
  } catch (parseErr) {
    diagnostics.sanitizationsApplied.push(`parse_error: ${parseErr.message}`);
    
    try {
      diagnostics.stepsAttempted.push("4_heuristic_repair");
      const repaired = attemptHeuristicRepair(jsonString);
      parsedObj = JSON.parse(repaired);
      diagnostics.sanitizationsApplied.push("heuristic_repair_success");
    } catch (repairErr) {
      throw new Error(`MALFORMED_JSON: Failed to parse JSON. Error: ${parseErr.message}`);
    }
  }

  diagnostics.stepsAttempted.push("5_zod_schema_validation");
  const validationResult = WorkspaceSchema.safeParse(parsedObj);

  if (validationResult.success) {
    diagnostics.zodValidationPassed = true;
    const data = validationResult.data;
    
    // Ensure at least 5 flashcards and 10 quiz questions
    data.flashcards = padFlashcards(data.flashcards, data.topic);
    data.quiz = padQuizQuestions(data.quiz, data.topic);

    return { data, diagnostics };
  } else {
    diagnostics.sanitizationsApplied.push(`zod_defaults_injected: ${validationResult.error.issues.length} issues`);

    const safeFallback = {
      sessionId: parsedObj?.sessionId || `sess_${Date.now()}`,
      topic: parsedObj?.topic || 'Study Session',
      category: parsedObj?.category || 'Computer Science',
      progressPct: parsedObj?.progressPct || 50,
      estimatedStudyTimeMins: parsedObj?.estimatedStudyTimeMins || 25,
      statsSummary: parsedObj?.statsSummary || { conceptsCount: 15, flashcardsCount: 5, quizQuestionsCount: 10, weakAreasCount: 3 },
      prerequisites: Array.isArray(parsedObj?.prerequisites) ? parsedObj.prerequisites : ['Fundamentals'],
      conceptNodes: Array.isArray(parsedObj?.conceptNodes) ? parsedObj.conceptNodes : [],
      flashcards: padFlashcards(Array.isArray(parsedObj?.flashcards) ? parsedObj.flashcards : [], parsedObj?.topic),
      quiz: padQuizQuestions(Array.isArray(parsedObj?.quiz) ? parsedObj.quiz : [], parsedObj?.topic),
      weakTopics: Array.isArray(parsedObj?.weakTopics) ? parsedObj.weakTopics : [],
      revisionPlan: Array.isArray(parsedObj?.revisionPlan) ? parsedObj.revisionPlan : []
    };

    return { data: safeFallback, diagnostics };
  }
}

export const parseAndValidateWorkspaceData = parseAndValidateWorkspace;

function padFlashcards(cards, topic = 'Concept') {
  const result = [...cards];
  const DEFAULT_CARDS = [
    { concept: `${topic} Overview`, question: `What is the primary objective of ${topic}?`, answer: `${topic} focuses on fundamental principles, key architectures, and practical trade-offs.`, difficulty: 'Medium', category: 'Core' },
    { concept: `${topic} Key Architecture`, question: `What are the core components of ${topic}?`, answer: `The architecture consists of modular inputs, processing layers, optimization algorithms, and output validation.`, difficulty: 'Medium', category: 'Architecture' },
    { concept: `${topic} Optimization`, question: `How do you optimize performance in ${topic}?`, answer: `Performance is optimized through proper parameter tuning, resource allocation, and latency reduction techniques.`, difficulty: 'Hard', category: 'Performance' },
    { concept: `${topic} Trade-offs`, question: `What are the primary trade-offs in ${topic}?`, answer: `Common trade-offs involve balancing computational complexity, accuracy, execution speed, and resource overhead.`, difficulty: 'Medium', category: 'Trade-offs' },
    { concept: `${topic} Practical Applications`, question: `Where is ${topic} applied in modern software engineering?`, answer: `It is widely applied in scalable system architecture, distributed computing, and real-time decision pipelines.`, difficulty: 'Easy', category: 'Applications' },
    { concept: `${topic} Data Flow`, question: `How does information flow through ${topic}?`, answer: `Data enters via structured ingestion pipelines, undergoes validation, passes through core processing routines, and outputs verified results.`, difficulty: 'Medium', category: 'Data Flow' },
    { concept: `${topic} Error Handling`, question: `How does ${topic} ensure fault tolerance?`, answer: `Fault tolerance is achieved using exception isolation, automated retries, fallback safe states, and defensive data bounds.`, difficulty: 'Hard', category: 'Resilience' },
    { concept: `${topic} Scalability Patterns`, question: `What strategies scale ${topic} efficiently?`, answer: `Horizontal scaling, asynchronous task queues, caching layers, and decoupled state management ensure seamless scaling.`, difficulty: 'Hard', category: 'Scalability' },
    { concept: `${topic} Best Practices`, question: `What is the most recommended design pattern for ${topic}?`, answer: `Adhere to modular separation of concerns, strict type validation, stateless handlers, and clear documentation.`, difficulty: 'Easy', category: 'Best Practices' },
    { concept: `${topic} Future Outlook`, question: `How is ${topic} evolving in modern industry?`, answer: `Industry trends focus on automation, AI-driven parameter tuning, tighter security boundaries, and zero-downtime updates.`, difficulty: 'Medium', category: 'Industry' }
  ];

  while (result.length < 10) {
    const filler = DEFAULT_CARDS[result.length % DEFAULT_CARDS.length];
    result.push({
      id: `card_pad_${result.length}_${Date.now()}`,
      ...filler
    });
  }

  return result.slice(0, 10);
}

function padQuizQuestions(quizList, topic = 'Concept') {
  const result = [...quizList];
  const DEFAULT_QUIZ = [
    { question: `Which statement best describes ${topic}?`, options: [`A foundational engineering paradigm focused on efficient processing.`, `An obsolete design pattern no longer in use.`, `A manual file format specification.`, `A database backup command.`], correctIndex: 0, explanation: `${topic} provides essential principles for modern software architecture and algorithmic processing.` },
    { question: `What is a primary advantage of implementing ${topic}?`, options: [`Improves scalability, modularity, and resource efficiency.`, `Decreases code readability.`, `Requires zero memory allocation.`, `Disables all security protocols.`], correctIndex: 0, explanation: `Proper implementation of ${topic} significantly enhances system scalability and maintainability.` },
    { question: `Which component is critical for ${topic}?`, options: [`Core optimization engine & data representation layer.`, `Unused background loop.`, `Static CSS file.`, `Hardcoded local port.`], correctIndex: 0, explanation: `The optimization engine and data layer form the backbone of ${topic}.` },
    { question: `How does ${topic} handle system bottlenecks?`, options: [`By distributing workload and leveraging parallel processing.`, `By stopping execution entirely.`, `By deleting input data.`, `By disabling network requests.`], correctIndex: 0, explanation: `Parallel execution and workload distribution help eliminate bottlenecks.` },
    { question: `What is the recommended approach for testing ${topic}?`, options: [`Automated unit testing, integration drills, and stress validation.`, `Skipping all test suites.`, `Manual print statements only.`, `Ignoring log outputs.`], correctIndex: 0, explanation: `Comprehensive testing ensures resilience under high production loads.` },
    { question: `Which performance metric is most relevant to ${topic}?`, options: [`Throughput, latency, and memory footprint.`, `Line count of comments.`, `Color palette choice.`, `Font family selection.`], correctIndex: 0, explanation: `Throughput, latency, and resource usage dictate overall system performance.` },
    { question: `When should ${topic} be refactored?`, options: [`When performance metrics fall below SLA thresholds or requirements evolve.`, `Never under any circumstances.`, `Every 5 minutes.`, `Only on weekends.`], correctIndex: 0, explanation: `Refactoring is triggered when performance degrades or requirements scale.` },
    { question: `What is a common pitfall in ${topic}?`, options: [`Over-engineering without measuring actual bottlenecks.`, `Writing clear documentation.`, `Using version control.`, `Running automated unit tests.`], correctIndex: 0, explanation: `Premature optimization without profiling often leads to unnecessary complexity.` },
    { question: `How does caching benefit ${topic}?`, options: [`Reduces latency by serving frequently accessed results locally.`, `Increases disk I/O operations.`, `Slows down CPU execution.`, `Forces network roundtrips.`], correctIndex: 0, explanation: `Caching avoids redundant computations by serving responses from memory.` },
    { question: `What is the ultimate goal of mastering ${topic}?`, options: [`To build resilient, high-performance, and scalable software solutions.`, `To memorize syntax rules only.`, `To avoid writing code.`, `To slow down execution speed.`], correctIndex: 0, explanation: `Mastery enables engineers to design state-of-the-art scalable applications.` }
  ];

  while (result.length < 10) {
    const filler = DEFAULT_QUIZ[result.length % DEFAULT_QUIZ.length];
    result.push({
      id: `q_pad_${result.length}_${Date.now()}`,
      ...filler
    });
  }

  return result.slice(0, 10);
}
