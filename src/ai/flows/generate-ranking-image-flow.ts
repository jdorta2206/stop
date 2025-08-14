'use server';

import { ai } from '@/lib/genkit';
import { z } from 'zod';

const PlayerSchema = z.object({
  rank: z.number().describe('La posición del jugador en el ranking.'),
  name: z.string().describe('El nombre del jugador.'),
  score: z.number().describe('La puntuación total del jugador.'),
  avatar: z.string().optional().describe('URL del avatar del jugador.'),
});

const GenerateRankingImageInputSchema = z.object({
  topPlayers: z.array(PlayerSchema).length(3).describe('Una lista con los 3 mejores jugadores.'),
  timeframe: z.enum(['semanal', 'diario']).describe('El período de tiempo del ranking.'),
});

// El output ahora es solo el texto del post, la imagen se genera en el cliente.
const GenerateRankingImageOutputSchema = z.object({
  postText: z.string().describe('Un texto para la publicación en redes sociales, felicitando a los ganadores, mencionando sus nombres y puntuaciones, e invitando a otros a jugar.')
});

export type GenerateRankingImageInput = z.infer<typeof GenerateRankingImageInputSchema>;
export type GenerateRankingImageOutput = z.infer<typeof GenerateRankingImageOutputSchema>;

// Se ajusta el prompt para solicitar solo el texto del post
const rankingPrompt = ai.definePrompt({
    name: 'rankingTextPrompt',
    input: { schema: GenerateRankingImageInputSchema },
    output: { schema: GenerateRankingImageOutputSchema },
    prompt: `
      Eres un asistente de redes sociales para "STOP Game". Tu tarea es escribir el texto para una publicación de Facebook que anuncie a los ganadores del ranking {{timeframe}}.
      
      **Tarea: Escribir el Texto del Post**
      - Redacta un texto corto y enérgico para la publicación de Facebook en español.
      - Felicita a los tres mejores jugadores por su nombre: {{topPlayers.[0].name}}, {{topPlayers.[1].name}}, y {{topPlayers.[2].name}}.
      - Anima a la comunidad a jugar para aparecer en el próximo ranking.
      - Incluye hashtags relevantes como #StopGame, #Ranking, #JuegoDePalabras, #Ganadores.
    `,
});

const generateRankingTextFlow = ai.defineFlow(
  {
    name: 'generateRankingTextFlow',
    inputSchema: GenerateRankingImageInputSchema,
    outputSchema: GenerateRankingImageOutputSchema,
  },
  async (input: GenerateRankingImageInput) => {
    const { output } = await rankingPrompt(input);

    if (!output?.postText) {
      throw new Error("La IA no pudo generar el texto para el ranking.");
    }
    
    return {
      postText: output.postText
    };
  }
);

// La función principal ahora solo genera texto. La imagen se manejará en el frontend.
export async function generateRankingText(input: GenerateRankingImageInput): Promise<GenerateRankingImageOutput> {
  return await generateRankingTextFlow(input);
}
