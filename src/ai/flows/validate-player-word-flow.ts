
'use server';

import { ai } from '@/lib/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';


const PlayerResponseSchema = z.object({
  category: z.string().describe('La categoría de la palabra.'),
  word: z.string().optional().describe('La palabra escrita por el jugador.'),
});

const ResultDetailSchema = z.object({
  response: z.string().describe("La palabra que se evaluó. Debe ser una cadena vacía si no se proporcionó ninguna palabra."),
  isValid: z.boolean().describe("Si la palabra fue considerada válida por la IA (pertenece a la categoría, empieza con la letra, es real). Es `false` si no se proporcionó palabra."),
  score: z.number().describe("La puntuación obtenida para esta palabra (10 si es válida, 0 si no lo es).")
});

const AIOutputSchema = z.record(z.string(), ResultDetailSchema)
  .describe("Un objeto donde cada clave es una categoría y el valor contiene los resultados de la evaluación.");

const EvaluateRoundInputSchema = z.object({
  letter: z.string().length(1),
  language: z.enum(['es', 'en', 'fr', 'pt']),
  playerResponses: z.array(PlayerResponseSchema),
});

const EvaluateRoundOutputSchema = z.object({
    results: AIOutputSchema,
    totalScore: z.number().describe("La puntuación total del jugador para la ronda.")
});

export type EvaluateRoundInput = z.infer<typeof EvaluateRoundInputSchema>;
export type EvaluateRoundOutput = z.infer<typeof EvaluateRoundOutputSchema>;

const evaluateRoundPrompt = ai.definePrompt({
  name: 'evaluateRoundPrompt',
  input: { schema: EvaluateRoundInputSchema },
  output: { schema: AIOutputSchema },
  prompt: `
    Eres el juez experto del juego "STOP". Tu tarea es evaluar las palabras de una ronda para una letra y un idioma específicos.

    **Reglas de Evaluación (aplica para cada categoría):**
    1.  **Validación de la Palabra:**
        -   ¿La palabra es real en el idioma '{{language}}'?
        -   ¿Pertenece a la categoría proporcionada?
        -   ¿Empieza con la letra '{{letter}}' (ignorando mayúsculas/minúsculas)?
        -   Si la palabra es 'VACÍA' o no cumple alguna de las condiciones, es INVÁLIDA.
    2.  **Asignación de Puntuación:**
        -   Si la palabra es VÁLIDA, la puntuación es 10.
        -   Si la palabra es INVÁLIDA, la puntuación es 0.
    
    **Respuestas del Jugador:**
    {{#each playerResponses}}
    - Categoría: {{this.category}}, Palabra: {{this.word}}
    {{/each}}

    **IMPORTANTE: Formato de Salida Obligatorio (JSON):**
    -   Debes devolver un objeto JSON.
    -   Las claves de este objeto deben ser los nombres EXACTOS de las categorías recibidas.
    -   Cada valor debe ser un objeto con:
        - 'response': La palabra exacta que el jugador escribió (o una cadena vacía si estaba 'VACÍA').
        - 'isValid': Un booleano (true si es válida, false si no).
        - 'score': Un número (10 para válida, 0 para inválida).
    -   Tu respuesta DEBE contener una entrada para CADA una de las categorías proporcionadas.
  `,
  config: {
    temperature: 0.0,
  }
});


const evaluateRoundFlow = ai.defineFlow(
  {
    name: 'evaluateRoundFlow',
    inputSchema: EvaluateRoundInputSchema,
    outputSchema: EvaluateRoundOutputSchema,
  },
  async (input) => {
    
    // Mapeo para el prompt, asegurando que las palabras vacías se marquen
    const promptInput = {
        ...input,
        playerResponses: input.playerResponses.map(p => ({
            ...p,
            word: p.word || 'VACÍA'
        }))
    };

    const { output } = await evaluateRoundPrompt(promptInput, { model: googleAI('gemini-pro') });

    if (!output) {
      throw new Error("La IA no pudo procesar la evaluación de la ronda.");
    }
    
    let totalScore = 0;
    const finalResults: z.infer<typeof AIOutputSchema> = {};

    // Asegurarse de que todas las categorías de entrada estén en la salida
    for (const p of input.playerResponses) {
        if (output[p.category]) {
            const result = output[p.category];
            // Corregir la respuesta si era 'VACÍA'
            if (result.response === 'VACÍA') {
                result.response = '';
            }
            finalResults[p.category] = result;
            totalScore += result.score;
        } else {
            // Si la IA omite una categoría, se añade un resultado por defecto.
            finalResults[p.category] = {
                response: p.word || '',
                isValid: false,
                score: 0
            };
        }
    }

    return {
        results: finalResults,
        totalScore: totalScore
    };
  }
);


export async function evaluateRound(input: EvaluateRoundInput): Promise<EvaluateRoundOutput> {
  return await evaluateRoundFlow(input);
}
