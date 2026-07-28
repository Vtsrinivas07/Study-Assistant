# Study Assistant AI

Study Assistant AI is a web application built with React, Vite, and Tailwind CSS. It transforms free-form study notes or lecture topics into interactive learning materials, generating flashcards and structured multiple-choice quizzes.

The application focuses on transforming unpredictable AI model output into a reliable, failure-resilient user interface.

---

## Features

- **Free-Form Text & Topic Processing**: Paste raw lecture notes or select pre-configured topics to generate structured study materials.
- **Interactive Flashcards**: 
  - Review concepts one card at a time with card flipping.
  - Track card mastery using self-evaluation actions.
  - Dedicated Re-Test mode for cards flagged for review.
- **10-Question Interactive Quiz**:
  - Single-select multiple-choice format.
  - Continuous 10-minute countdown timer with auto-submission upon completion.
  - Submission confirmation dialog showing answered and unanswered question counts.
  - Comprehensive performance summary including percentage score, time taken, correct/incorrect/skipped breakdown, and detailed answer explanations.
- **Defensive Data Engine**:
  - Multi-tier JSON parsing pipeline to handle malformed LLM responses, unclosed code blocks, and schema mismatches cleanly without crashing the UI.

---

## Project Setup

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm or yarn package manager
- A Groq API key (free tier available at [groq.com](https://console.groq.com))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Vtsrinivas07/Study-Assistant.git
   cd Study-Assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
   *Note: `VITE_GROQ_API_KEY` is also supported.*

4. Run the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5176` (or the port indicated in your terminal) in your browser.

5. Build for production:
   ```bash
   npm run build
   ```

---

## Application Usage

1. **Enter Topic or Notes**: Type or paste your study material into the main text area, or click one of the popular topic chips.
2. **Select Learning Mode**:
   - Click **Start Flashcards (10 Cards)** to enter flashcard drill mode.
   - Click **Start Quiz (10 Questions)** to jump directly into quiz mode.
3. **Flashcards Mode**:
   - Tap or press space to flip the card and reveal the answer.
   - Click **Review Again (Left)** or **Know It (Right)** to progress.
   - Upon finishing the deck, choose to retake flagged cards, restart the full deck, regenerate new cards, or proceed to the quiz.
4. **Quiz Mode**:
   - Select your choice for each of the 10 questions.
   - Navigate between questions using the numbers grid or Previous/Next buttons.
   - Click **Submit Quiz** to view your score breakdown and answer review explanations.

---

## AI Usage Note

AI assistance (Claude and ChatGPT) was utilized throughout the development process for specific tasks:

- **Prompt Engineering**: Drafting structured system prompts to instruct the LLM to output valid JSON matching required array shapes.
- **Defensive Parser Design**: Designing regex-based heuristic repair functions to handle truncated JSON strings and control character escaping.
- **Boilerplate & Styling**: Accelerating initial React component structure and Tailwind CSS utility styling.
- **Refactoring & Code Review**: Reviewing edge cases for race conditions during rapid state updates and verifying build output cleanups.

All core application logic, state flow, UI interaction polish, defensive fallbacks, and component integration were verified and refined manually.

---

## Technical Limitations

- **API Rate Limits**: Requests rely on the Groq API free tier. High traffic or rapid consecutive requests may hit rate limits.
- **Local Browser State**: Study sessions are cached in browser `localStorage`. Refreshing or clearing site data resets stored active sessions.
- **Fixed Item Count Bounds**: The data validator normalizes output to strictly 10 flashcards and 10 quiz questions per topic.

---

## Time Spent

- **Total Time**: Approximately 7.5 hours

### Breakdown:
- **Architecture & System Design**: 1.0 hour
- **AI Integration & Defensive Validation Pipeline**: 2.0 hours
- **Flashcards & Quiz UI Development**: 2.5 hours
- **Error Resiliency & State Refactoring**: 1.0 hour
- **Testing, Build Verification & Documentation**: 1.0 hour
