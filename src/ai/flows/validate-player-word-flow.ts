
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
  score: z.number().describe("La puntuación obtenida para esta palabra (10 si es válida, 0 si no lo es).")
});

const AIOutputSchema = z.record(
    z.string(), // Category name
    ResultDetailSchema
  ).describe("Un objeto donde cada clave es una categoría y el valor contiene los resultados de la evaluación.");

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
      .map(p => `- Categoría: ${p.category}, Palabra: ${p.word || 'VACÍA'}`)
      .join('\n');

    const systemPrompt = `
      Eres el juez experto del juego "STOP". Tu tarea es evaluar las palabras de una ronda para una letra y un idioma específicos.
      
      **Reglas de Evaluación (aplica para cada categoría):**
      1.  **Validación de la Palabra:**
          -   ¿La palabra es real en el idioma '${input.language}'?
          -   ¿Pertenece a la categoría proporcionada?
          -   ¿Empieza con la letra '${input.letter}' (ignorando mayúsculas/minúsculas)?
          -   Si las tres condiciones se cumplen, la palabra es VÁLIDA.
      2.  **Asignación de Puntuación:**
          -   Si la palabra es VÁLIDA, la puntuación es 10.
          -   Si la palabra es INVÁLIDA (no empieza con la letra, no es real, no encaja en la categoría) o si la palabra está VACÍA, la puntuación es 0.
      3.  **Formato de Salida Obligatorio (JSON):**
          -   Debes devolver un objeto JSON.
          -   Las claves de este objeto deben ser los nombres EXACTOS de las categorías recibidas.
          -   Cada valor debe ser un objeto con:
              - 'response': La palabra exacta que el jugador escribió (o una cadena vacía si estaba 'VACÍA').
              - 'isValid': Un booleano (true si es válida, false si no).
              - 'score': Un número (10 para válida, 0 para inválida).
      
      **IMPORTANTE:** Tu respuesta DEBE contener una entrada para CADA una de las categorías proporcionadas, incluso si la palabra estaba 'VACÍA'. No omitas ninguna categoría.
    `;

    const userPrompt = `
      Evalúa las siguientes respuestas para la letra '${input.letter}' en el idioma '${input.language}':
      ${playerResponsesText}
    `;

    const { output: aiResults } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      prompt: userPrompt,
      output: {
        format: 'json',
        schema: AIOutputSchema,
      },
      config: {
        temperature: 0.1
      }
    });
    
    if (!aiResults) {
      throw new Error("La IA no pudo procesar la evaluación de la ronda o devolvió un formato inválido.");
    }
    
    let totalScore = 0;
    const finalResults: z.infer<typeof AIOutputSchema> = {};

    // Asegurarse de que todas las categorías de entrada estén en la salida
    for (const p of input.playerResponses) {
        if (aiResults[p.category]) {
            finalResults[p.category] = aiResults[p.category];
            totalScore += aiResults[p.category].score;
        } else {
            // Si la IA omite una categoría (no debería ocurrir con el prompt actual), se añade un resultado por defecto.
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

    