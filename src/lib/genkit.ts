import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Este archivo NO debe tener 'use server'. Es un módulo de configuración.
// La clave de API se toma automáticamente de las variables de entorno (process.env.GEMINI_API_KEY).

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: "YOUR_GEMINI_API_KEY" })
  ],
});
