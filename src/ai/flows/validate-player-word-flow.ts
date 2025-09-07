
'use server';

import { ai } from '@/lib/genkit';
import { z } from 'zod';

const PlayerResponseSchema = z.object({
  category: z.string(),
  word: z.string().optional(),
});

const ResultDetailSchema = z.object({
  response: z.string().describe("La palabra que se evaluó. Debe ser una cadena vacía si no se proporcionó ninguna palabra."),
  isValid: z.boolean().describe("Si la palabra fue considerada válida por la IA (pertenece a la categoría, empieza con la letra, es real). Es `false` si no se proporcionó palabra."),
  score: z.number().describe("La puntuación obtenida para esta palabra (10 si es válida y única, 5 si es válida pero no única, 0 si no lo es).")
});

// Este es el schema que la IA DEBE devolver.
const AIOutputSchema = z.record(
    z.string(), // Category name
    ResultDetailSchema
  ).describe("Un objeto donde cada clave es una categoría y el valor contiene los resultados de la evaluación del jugador.");

// Este es el schema final que la función devuelve, garantizando el totalScore.
const EvaluateRoundOutputSchema = z.object({
    results: AIOutputSchema,
    totalScore: z.number().describe("La puntuación total del jugador para la ronda.")
});


const evaluateRoundInputSchema = z.object({
  letter: z.string().length(1),
  language: z.enum(['es', 'en', 'fr', 'pt']),
  playerResponses: z.array(PlayerResponseSchema),
});

export type EvaluateRoundInput = z.infer<typeof evaluateRoundInputSchema>;
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
          -   You MUST return a JSON object.
          -   The JSON object's keys MUST be the exact category names from the user's input.
          -   For each category key, the value MUST be an object with:
              - 'response': The exact word the player provided, or an empty string if they provided none.
              - 'isValid': a boolean (true if valid, false otherwise).
              - 'score': a number (10 for a valid word, 0 otherwise).
      
      You MUST return a key for EVERY category the user sent. If all words are invalid, you must still return the object with all categories, with 'isValid' set to false and 'score' set to 0 for each. Even if the user provides an empty word, you must include the category in the final JSON with an empty 'response', 'isValid' as false, and 'score' as 0.

      Example for user input "Category: Animal, Word: Tigre" and "Category: Color, Word: EMPTY":
      {
        "Animal": { "response": "Tigre", "isValid": true, "score": 10 },
        "Color": { "response": "", "isValid": false, "score": 0 }
      }
    `;

    const userPrompt = `
      Evaluate the following words for the letter '${input.letter}' in language '${input.language}'.
      Player Input:
      ${playerResponsesText}
    `;

    // Aumentar el timeout para dar tiempo a la IA a procesar
    const { output: aiResults } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      prompt: userPrompt,
      output: {
        format: 'json',
        schema: AIOutputSchema,
      },
      config: {
        temperature: 0.1 // Bajar la temperatura para respuestas más deterministas
      }
    });
    
    if (!aiResults) {
      throw new Error("The AI could not process the round evaluation or returned an invalid format.");
    }
    
    // GARANTÍA: Asegurarse de que cada categoría tiene una entrada, incluso si la IA omite una.
    // También, calcular el puntaje total de forma segura aquí.
    let totalScore = 0;
    const finalResults: z.infer<typeof AIOutputSchema> = {};

    for (const p of input.playerResponses) {
        if (aiResults[p.category]) {
            finalResults[p.category] = aiResults[p.category];
            totalScore += aiResults[p.category].score;
        } else {
            console.warn(`AI did not return result for category: ${p.category}. Creating default.`);
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
