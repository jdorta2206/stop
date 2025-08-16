import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Este archivo NO debe tener 'use server'. Es un módulo de configuración.
// La clave de API se toma directamente de aquí.

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: "AlzaSyD4AzZg-OXHOGEN_Yzmp_6P3ZWIPMUd5Ac" })
  ],
});
