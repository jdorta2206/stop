import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

if (!process.env.GEMINI_API_KEY) {
  // This check is useful for developers, but console logging in server files can be problematic.
  // Consider a more robust logging or configuration validation strategy for production.
}

// This file does not use 'use server' because it needs to export the 'ai' object,
// which is not an async function. This object is then imported by server-side files (flows).
export const ai = genkit({
  plugins: [
    googleAI()
  ]
});
