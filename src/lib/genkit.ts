
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from "@genkit-ai/firebase";
import { firebaseAuth } from "firebase-admin/auth";
// Este archivo es un módulo de configuración.
// La clave de API se toma desde las variables de entorno.

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
    firebase(),
  ],
});
