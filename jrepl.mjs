import repl from 'node:repl';
import { j_typeof } from './j_typeof.mjs';

// Build a timestamp prompt string using the current local date and time
function formatPrompt() {
  const now = new Date();
  const date = now.toLocaleDateString("sv-SE"); // YYYY-MM-DD, local time
  const time = now.toTimeString().slice(0, 8); // HH:MM:SS (local time)
  return `[${date} ${time}] > `;
}

// Add classroom helper functions to the REPL's session context
function attachHelpers(context) {
  context.j_typeof = j_typeof;
}

// Start an isolated REPL context (useGlobal defaults to false so .clear wipes variables)
const r = repl.start({
  prompt: formatPrompt(),
});

// Attach helpers initially
attachHelpers(r.context);

// Update the prompt timestamp right before Node draws a fresh prompt
const originalDisplayPrompt = r.displayPrompt.bind(r);
r.displayPrompt = (preserveCursor) => {
  r.setPrompt(formatPrompt());
  return originalDisplayPrompt(preserveCursor);
};

// Re-attach helpers to the new context object whenever .clear runs
r.on('reset', (context) => {
  attachHelpers(context);
});
