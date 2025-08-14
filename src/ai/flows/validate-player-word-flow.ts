'use server';

import { ai } from '@/lib/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

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

const evaluateRoundPrompt = ai.definePrompt({
    name: 'evaluateRoundPrompt',
    model: googleAI.model('gemini-1.5-flash'),
    input: { schema: EvaluateRoundInputSchema },
    output: { schema: EvaluateRoundOutputSchema },
    prompt: `
      You are the expert judge of the game "STOP". Your task is to evaluate the words of a round and generate answers for the AI.
      You will receive a letter, a language, and the player's responses for various categories.

      Follow these rules strictly for EACH category:
      1.  **Validate the player's word**:
          -   Is it a real and known word in the language '{{language}}'?
          -   Does it belong to the corresponding category?
          -   Does it start with the letter '{{letter}}'?
          -   If any of these conditions are not met, or if the player's 'word' field is empty, the word is invalid (isValid: false). If it is valid, mark isValid: true.
          -   In the player's 'response' field, return the exact word they gave you.

      2.  **Generate a word for the AI**:
          -   Create a valid and creative word for the same category, letter, and language. If possible, different from the player's.
          -   If you can't think of one, leave the AI's 'response' field empty and mark 'isValid' as false. If you generate one, mark it as 'isValid: true'.
      
      3.  **Score Calculation**:
          -   If the player's word is valid and the AI's is not (or is different), the player's score is 10.
          -   If both words are valid and are the same (case-insensitive), the score for both is 5.
          -   If an entry is invalid or not provided, its score is 0.
          -   Assign the corresponding points in each one's 'score' field.

      **Player Input:**
      {{#each playerResponses}}
      - Category: {{category}}, Word: {{word}}
      {{/each}}
      
      Return the validation, words, and scores in the specified JSON format.
    `,
    config: {
        timeout: 30000 // Timeout de 30 segundos
    }
});


const evaluateRoundFlow = ai.defineFlow(
  {
    name: 'evaluateRoundFlow',
    inputSchema: EvaluateRoundInputSchema,
    outputSchema: EvaluateRoundOutputSchema,
  },
  async (input: EvaluateRoundInput) => {
    const { output } = await evaluateRoundPrompt(input);
    if (!output) {
      throw new Error("The AI could not process the round evaluation.");
    }
    return output;
  }
);

export async function evaluateRound(input: EvaluateRoundInput): Promise<EvaluateRoundOutput> {
  return await evaluateRoundFlow(input);
}
