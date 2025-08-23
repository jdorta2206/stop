
'use server';

import { ai } from '@/lib/genkit';
import { z } from 'zod';

const PlayerResponseSchema = z.object({
  category: z.string(),
  word: z.string().optional(),
});

const EvaluateRoundInputSchema = z.object({
  letter: z.string().length(1),
  language: z.enum(['es', 'en', 'fr', 'pt']),
  playerResponses: z.array(PlayerResponseSchema),
});

const ResultDetailSchema = z.object({
  response: z.string().describe("La palabra que se evaluó. Debe ser una cadena vacía si no se proporcionó ninguna palabra."),
  isValid: z.boolean().describe("Si la palabra fue considerada válida por la IA (pertenece a la categoría, empieza con la letra, es real). Es `false` si no se proporcionó palabra."),
  score: z.number().describe("La puntuación obtenida para esta palabra (10 si es válida, 0 si no lo es).")
});

const EvaluateRoundOutputSchema = z.object({
  results: z.record(
    z.string(), // Category name
    ResultDetailSchema
  ).describe("Un objeto donde cada clave es una categoría y el valor contiene los resultados de la evaluación del jugador."),
});


export type EvaluateRoundInput = z.infer<typeof EvaluateRoundInputSchema>;
export type EvaluateRoundOutput = z.infer<typeof EvaluateRoundOutputSchema>;

export async function evaluateRound(input: EvaluateRoundInput): Promise<EvaluateRoundOutput> {
    const playerResponsesText = input.playerResponses
      .map(p => `- Category: ${p.category}, Word: ${p.word || 'EMPTY'}`)
      .join('\n');

    const systemPrompt = `
      You are the expert judge of the game "STOP". Your task is to evaluate the words of a round based on a given letter and language.
      Follow these rules strictly for EACH category provided by the user:
      1.  **Validate the player's word**:
          -   Check if the word is a real and known word in the specified language ('${input.language}').
          -   Check if it belongs to the corresponding category.
          -   Check if it starts with the specified letter ('${input.letter}'), case-insensitively.
          -   If all three conditions are met, the word is valid.
      2.  **Determine Score**:
          -   If the word is valid, the score is 10.
          -   If the word is invalid (doesn't start with the letter, is not a real word, doesn't fit the category) or if the word is 'EMPTY' or not provided, the score is 0.
      3.  **Output Format**:
          -   For each category, you MUST return an object with:
              - 'response': The exact word the player provided, or an empty string if they provided none.
              - 'isValid': a boolean (true if valid, false otherwise).
              - 'score': a number (10 for a valid word, 0 otherwise).
      
      You MUST return the output in the specified JSON format, with a key for every category the user sent. If all words are invalid, you must still return the object with all categories, isValid set to false and score set to 0 for each. Even if the user provides an empty word, you must include the category in the final JSON with an empty 'response', 'isValid' as false, and 'score' as 0.
    `;

    const userPrompt = `
      Evaluate the following words for the letter '${input.letter}' in language '${input.language}'.
      Player Input:
      ${playerResponsesText}
    `;

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      prompt: userPrompt,
      output: {
        format: 'json',
        schema: EvaluateRoundOutputSchema,
      },
      config: {
          timeout: 45000 // Increased timeout to 45 seconds
      }
    });

    if (!output || !output.results) {
      throw new Error("The AI could not process the round evaluation or returned an invalid format.");
    }
    
    // GUARANTEE: Ensure every category has an entry, even if the AI misses one. This is critical.
    for (const p of input.playerResponses) {
        if (!output.results[p.category]) {
            output.results[p.category] = {
                response: p.word || '',
                isValid: false,
                score: 0
            };
        }
    }

    return output;
}
