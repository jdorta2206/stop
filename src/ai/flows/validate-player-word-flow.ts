

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

  // Diccionario de la IA (NORMALIZADO A MINÚSCULAS)
  const aiDictionary: Record<string, string[]> = {
    nombre: ["ana", "andrés", "antonio", "beatriz", "benito", "bárbara", "carlos", "cecilia", "césar", "david", "dolores", "diana", "elena", "esteban", "eva", "fabián", "fatima", "fernando", "gabriel", "gloria", "gonzalo", "hugo", "helena", "héctor", "ignacio", "irene", "isabel", "javier", "jimena", "juan", "karla", "kevin", "karina", "kike", "luis", "laura", "lucía", "manuel", "maría", "marta", "natalia", "nicolás", "noelia", "nuria", "óscar", "olivia", "omar", "pablo", "paula", "pedro", "quintín", "juana", "roberto", "raquel", "rosa", "santiago", "sofía", "susana", "tomás", "teresa", "tatiana", "ursula", "unai", "valentina", "victor", "vanesa", "walter", "wendy", "wanda", "xavier", "ximena", "yolanda", "yasmin", "yago", "zoe", "zacarías"],
    lugar: ["alemania", "argentina", "atenas", "brasil", "bogotá", "barcelona", "canadá", "china", "copenhague", "dinamarca", "dublín", "ecuador", "españa", "estocolmo", "francia", "finlandia", "florencia", "grecia", "guatemala", "ginebra", "holanda", "honduras", "helsinki", "italia", "irlanda", "islandia", "japón", "jamaica", "jerusalén", "kenia", "kuwait", "kiev", "libia", "lisboa", "londres", "méxico", "madrid", "moscú", "noruega", "nairobi", "nueva york", "oslo", "ottawa", "omán", "parís", "perú", "praga", "qatar", "quito", "rumanía", "roma", "rusia", "suecia", "suiza", "santiago", "tokio", "turquía", "toronto", "uruguay", "ucrania", "venecia", "vietnam", "varsovia", "washington", "wellington", "xalapa", "yemen", "zagreb", "zimbabue"],
    animal: ["araña", "águila", "avispa", "búho", "ballena", "buitre", "caballo", "canguro", "cocodrilo", "delfín", "dromedario", "dragón de komodo", "elefante", "erizo", "escorpión", "foca", "flamenco", "gato", "gacela", "gorila", "halcón", "hiena", "hipopótamo", "iguana", "impala", "jaguar", "jabalí", "jirafa", "koala", "krill", "león", "loro", "lobo", "mapache", "mariposa", "medusa", "nutria", "ñu", "orangután", "oso", "orca", "perro", "pingüino", "pantera", "quetzal", "rana", "ratón", "rinoceronte", "serpiente", "sapo", "tiburón", "tigre", "tortuga", "topo", "urraca", "urogallo", "vaca", "vicuña", "vívora", "wallaby", "wombat", "xoloitzcuintle", "yak", "yegua", "zorro", "zopilote"],
    objeto: ["anillo", "aguja", "arco", "barco", "botella", "brújula", "cámara", "cuchillo", "copa", "dado", "destornillador", "diamante", "escalera", "escoba", "espejo", "flauta", "flecha", "foco", "guitarra", "gafas", "globo", "hacha", "hilo", "imán", "impresora", "jarrón", "jeringa", "juguete", "lámpara", "lápiz", "libro", "martillo", "mesa", "micrófono", "nube", "navaja", "ordenador", "olla", "paraguas", "pelota", "piano", "queso", "reloj", "regla", "rueda", "silla", "sofá", "sombrero", "teléfono", "tijeras", "tambor", "uniforme", "usb", "violín", "vela", "ventana", "xilófono", "yoyo", "zapato", "zapatilla"],
    color: ["azul", "amarillo", "añil", "blanco", "beige", "burdeos", "cian", "carmesí", "castaño", "dorado", "esmeralda", "escarlata", "fucsia", "grana", "gris", "hueso", "índigo", "jade", "kaki", "lavanda", "lila", "marrón", "magenta", "marfil", "naranja", "negro", "ocre", "oro", "púrpura", "plata", "perla", "rojo", "rosa", "salmón", "turquesa", "terracota", "ultramar", "verde", "violeta", "vino", "wengue", "xantico", "zafiro"],
    fruta: ["arándano", "albaricoque", "aceituna", "banana", "cereza", "ciruela", "dátil", "durazno", "fresa", "frambuesa", "granada", "higo", "kiwi", "limón", "lima", "mandarina", "manzana", "melón", "mora", "naranja", "nectarina", "níspero", "papaya", "pera", "piña", "plátano", "pomelo", "sandía", "tamarindo", "toronja", "uva"],
    marca: ["adidas", "audi", "apple", "bic", "bosch", "casio", "chanel", "dior", "dell", "ebay", "elle", "fila", "ford", "gucci", "google", "hp", "honda", "ibm", "ikea", "intel", "jaguar", "jeep", "kodak", "kia", "lego", "levi's", "lg", "microsoft", "mercedes", "motorola", "nike", "nintendo", "nestlé", "omega", "oracle", "pepsi", "prada", "puma", "quick", "rolex", "ray-ban", "reebok", "samsung", "sony", "sega", "toyota", "tesla", "tissot", "uber", "umbro", "visa", "volkswagen", "versace", "walmart", "wikipedia", "xbox", "xiaomi", "yahoo", "youtube", "zara", "zoom"],
  };

  for (const playerResponse of input.playerResponses) {
    const categoryLower = playerResponse.category.toLowerCase();
    const playerWord = playerResponse.word || '';
    const playerWordLower = playerWord.toLowerCase().trim();

    // 1. Evaluar la palabra del jugador con lógica REFORZADA Y CORRECTA
    const categoryDictionary = aiDictionary[categoryLower] || [];
    const isPlayerWordValid = 
        playerWordLower.length > 1 &&
        playerWordLower.startsWith(letterLower) &&
        categoryDictionary.includes(playerWordLower);

    // 2. Simular la respuesta de la IA
    let aiWord = '';
    const possibleWords = aiDictionary[categoryLower]?.filter(w => w.startsWith(letterLower)) || [];
    if (Math.random() < 0.8 && possibleWords.length > 0) { // 80% chance for AI to know a word
        aiWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
    }
    const aiWordLower = aiWord.toLowerCase();

    const isAiWordValid = !!aiWord;
    
    // 3. Calcular puntuaciones
    let playerScore = 0;
    let aiScore = 0;

    if (isPlayerWordValid) {
        if (isAiWordValid && playerWordLower === aiWordLower) {
            playerScore = 5;
            aiScore = 5;
        } else if (isAiWordValid && playerWordLower !== aiWordLower) {
            playerScore = 10;
            aiScore = 10;
        } else {
            playerScore = 10;
        }
    } else {
         if (isAiWordValid) {
            aiScore = 10;
        }
    }


    // 4. Guardar resultados para la categoría
    results[playerResponse.category] = {
      player: {
        response: playerWord,
        isValid: isPlayerWordValid,
        score: playerScore,
      },
      ai: {
        response: aiWord ? aiWord.charAt(0).toUpperCase() + aiWord.slice(1) : '', // Capitalizar la palabra de la IA
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
