
'use server';

import { z } from 'zod';

const PlayerResponseSchema = z.object({
  category: z.string().describe('La categoría de la palabra.'),
  word: z.string().optional().describe('La palabra escrita por el jugador.'),
});

// Estructura para el resultado detallado de una palabra
const ResultDetailSchema = z.object({
  response: z.string().describe("La palabra que se evaluó. Debe ser una cadena vacía si no se proporcionó ninguna palabra."),
  isValid: z.boolean().describe("Si la palabra fue considerada válida (pertenece a la categoría, empieza con la letra, es real). Es `false` si no se proporcionó palabra."),
  score: z.number().describe("La puntuación obtenida para esta palabra (10, 5, o 0).")
});

// Estructura para los resultados de una categoría, incluyendo al jugador y a la IA
const CategoryResultSchema = z.object({
    player: ResultDetailSchema,
    ai: ResultDetailSchema,
});

// El output final de la IA es un objeto con los resultados por categoría
const AIOutputSchema = z.record(z.string(), CategoryResultSchema)
  .describe("Un objeto donde cada clave es una categoría y el valor contiene los resultados de la evaluación para el jugador y la IA.");


const EvaluateRoundInputSchema = z.object({
  letter: z.string().length(1),
  language: z.enum(['es', 'en', 'fr', 'pt']),
  playerResponses: z.array(PlayerResponseSchema),
});

// La salida ahora debe coincidir con la nueva estructura de resultados
const EvaluateRoundOutputSchema = z.object({
    results: AIOutputSchema,
    playerTotalScore: z.number().describe("La puntuación total del jugador para la ronda."),
    aiTotalScore: z.number().describe("La puntuación total de la IA para la ronda.")
});

export type EvaluateRoundInput = z.infer<typeof EvaluateRoundInputSchema>;
export type EvaluateRoundOutput = z.infer<typeof EvaluateRoundOutputSchema>;

/**
 * Simula la evaluación de la ronda localmente sin llamar a una IA.
 * Esta es una solución de contingencia debido a los bloqueos de la API.
 */
async function localEvaluateRound(input: EvaluateRoundInput): Promise<EvaluateRoundOutput> {
  const results: z.infer<typeof AIOutputSchema> = {};
  let playerTotalScore = 0;
  let aiTotalScore = 0;
  const letterLower = input.letter.toLowerCase();

  // Mini-diccionario para la IA (muy simple)
  const aiDictionary: Record<string, string[]> = {
    nombre: ['ana', 'andrés', 'antonio'],
    lugar: ['alemania', 'argentina', 'atenas'],
    animal: ['araña', 'águila', 'avispa'],
    objeto: ['anillo', 'aguja', 'arco'],
    color: ['azul', 'amarillo', 'añil'],
    fruta: ['arándano', 'albaricoque', 'aceituna'],
    marca: ['adidas', 'audi', 'apple'],
  };

  for (const playerResponse of input.playerResponses) {
    const categoryLower = playerResponse.category.toLowerCase();
    const playerWord = playerResponse.word || '';
    const playerWordLower = playerWord.toLowerCase();

    // 1. Evaluar la palabra del jugador
    const isPlayerWordValid = playerWord.trim() !== '' && playerWordLower.startsWith(letterLower);

    // 2. Simular la respuesta de la IA
    let aiWord = '';
    let isAiWordValid = false;
    // La IA tiene un 80% de probabilidad de "saber" una palabra
    if (Math.random() < 0.8) {
        const possibleWords = aiDictionary[categoryLower]?.filter(w => w.startsWith(letterLower));
        if (possibleWords && possibleWords.length > 0) {
            aiWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
            isAiWordValid = true;
        }
    }
    // Si no encontró una palabra, "inventa" una (o la deja en blanco)
    if (!aiWord) {
        aiWord = Math.random() < 0.5 ? `${input.letter}lgo` : ''; // inventa algo o la deja vacía
        isAiWordValid = false;
    }
    const aiWordLower = aiWord.toLowerCase();

    // 3. Calcular puntuaciones
    let playerScore = 0;
    let aiScore = 0;

    if (isPlayerWordValid && isAiWordValid) {
      if (playerWordLower === aiWordLower) {
        playerScore = 5;
        aiScore = 5;
      } else {
        playerScore = 10;
        aiScore = 10;
      }
    } else if (isPlayerWordValid) {
      playerScore = 10;
    } else if (isAiWordValid) {
      aiScore = 10;
    }

    // 4. Guardar resultados para la categoría
    results[playerResponse.category] = {
      player: {
        response: playerWord,
        isValid: isPlayerWordValid,
        score: playerScore,
      },
      ai: {
        response: aiWord.charAt(0).toUpperCase() + aiWord.slice(1), // Capitalizar la palabra de la IA
        isValid: isAiWordValid,
        score: aiScore,
      }
    };

    playerTotalScore += playerScore;
    aiTotalScore += aiScore;
  }

  return {
    results,
    playerTotalScore,
    aiTotalScore,
  };
}


export async function evaluateRound(input: EvaluateRoundInput): Promise<EvaluateRoundOutput> {
  // Se usa la función de evaluación local en lugar de llamar a la IA
  return await localEvaluateRound(input);
}
