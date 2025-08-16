
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Este archivo es un módulo de configuración.
// La clave de API se toma directamente de aquí.

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: "AIzaSyD4AzZg-OXHOGEN_Yzmp_6P3ZWIPMUd5Ac" })
  ],
});
