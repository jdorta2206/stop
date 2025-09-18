
'use server';

import { z } from 'zod';

const PlayerResponseSchema = z.object({
  category: z.string().describe('La categoría de la palabra.'),
  word: z.string().optional().describe('La palabra escrita por el jugador.'),
});

const ResultDetailSchema = z.object({
  response: z.string().describe("La palabra que se evaluó. Debe ser una cadena vacía si no se proporcionó ninguna palabra."),
  isValid: z.boolean().describe("Si la palabra fue considerada válida (pertenece a la categoría, empieza con la letra, es real). Es `false` si no se proporcionó palabra."),
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

/**
 * Simula la evaluación de la ronda localmente sin llamar a una IA.
 * Esta es una solución de contingencia debido a los bloqueos de la API.
 */
async function localEvaluateRound(input: EvaluateRoundInput): Promise<EvaluateRoundOutput> {
  const results: z.infer<typeof AIOutputSchema> = {};
  let totalScore = 0;
  const letterLower = input.letter.toLowerCase();

  for (const response of input.playerResponses) {
    const word = response.word || '';
    const wordLower = word.toLowerCase();

    // Lógica de validación simple:
    // 1. La palabra no debe estar vacía.
    // 2. La palabra debe empezar con la letra correcta (ignorando mayúsculas/minúsculas).
    const isValid = word.trim() !== '' && wordLower.startsWith(letterLower);
    const score = isValid ? 10 : 0;

    results[response.category] = {
      response: word,
      isValid: isValid,
      score: score,
    };

    totalScore += score;
  }

  return {
    results,
    totalScore,
  };
}


export async function evaluateRound(input: EvaluateRoundInput): Promise<EvaluateRoundOutput> {
  // Se usa la función de evaluación local en lugar de llamar a la IA
  return await localEvaluateRound(input);
}
