
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
  response: z.string().describe("La palabra que se evaluó o generó. Debe ser una cadena vacía si no se proporcionó o generó ninguna palabra."),
  isValid: z.boolean().describe("Si la palabra fue considerada válida por la IA (pertenece a la categoría, empieza con la letra, es real). Es `false` si no se proporcionó palabra."),
  score: z.number().describe("La puntuación obtenida para esta palabra (10, 5, o 0).")
});

const EvaluateRoundOutputSchema = z.object({
  results: z.record(
    z.string(), 
    z.object({
      player: ResultDetailSchema,
      ai: ResultDetailSchema,
    })
  ).describe("Un objeto donde cada clave es una categoría y el valor contiene los resultados del jugador y la IA."),
});


export type EvaluateRoundInput = z.infer<typeof EvaluateRoundInputSchema>;
export type EvaluateRoundOutput = z.infer<typeof EvaluateRoundOutputSchema>;

export async function evaluateRound(input: EvaluateRoundInput): Promise<EvaluateRoundOutput> {
    const playerResponsesText = input.playerResponses
      .map(p => `- Category: ${p.category}, Word: ${p.word || 'EMPTY'}`)
      .join('\n');

    const systemPrompt = `
      You are the expert judge of the game "STOP". Your task is to evaluate the words of a round and generate answers for the AI.
      Follow these rules strictly for EACH category provided by the user:
      1.  **Validate the player's word**:
          -   Check if the word is real and known in the specified language.
          -   Check if it belongs to the corresponding category.
          -   Check if it starts with the specified letter (case-insensitive).
          -   If any of these conditions are not met, or if the player's word is 'EMPTY', the word is invalid (isValid: false).
          -   If it is valid, mark isValid: true.
          -   In the player's 'response' field, return the exact word they gave (or an empty string if it was 'EMPTY').

      2.  **Generate a word for the AI**:
          -   Create a valid and creative word for the same category, letter, and language.
          -   If possible, make it different from the player's valid word.
          -   If you can't think of a valid word, leave the AI's 'response' field as an empty string and mark 'isValid' as false. If you generate one, mark it as 'isValid: true'.
      
      3.  **Score Calculation (for both player and AI)**:
          -   If a word is invalid or not provided, its score is 0.
          -   If a word is valid AND the other party's word is invalid or different, the score is 10.
          -   If both words are valid AND are the same (case-insensitive), the score for both is 5.
          -   Assign the calculated points in the 'score' field for both player and AI.
      
      You MUST return the output in the specified JSON format, with a key for every category the user sent.
    `;

    const userPrompt = `
      Letter: '${input.letter}'
      Language: '${input.language}'
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
          timeout: 30000 // Timeout de 30 segundos
      }
    });

    if (!output) {
      throw new Error("The AI could not process the round evaluation.");
    }
    return output;
}
