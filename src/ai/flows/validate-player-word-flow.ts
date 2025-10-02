
'use server';

import { z } from 'zod';

const PlayerResponseSchema = z.object({
  category: z.string().describe('La categoría de la palabra.'),
  word: z.string().optional().describe('La palabra escrita por el jugador.'),
});

// Estructura para el resultado detallado de una palabra (más estricta)
const ResultDetailSchema = z.object({
  response: z.string().describe("La palabra que se evaluó. Es una cadena vacía si no se proporcionó ninguna."),
  isValid: z.boolean().describe("Si la palabra fue considerada válida. Es `false` si no se proporcionó palabra."),
  score: z.number().describe("La puntuación obtenida (10, 5, o 0).")
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
    nombre: ["ana", "andrés", "antonio", "amanda", "alberto", "adriana", "beatriz", "benito", "bárbara", "bruno", "belén", "carlos", "cecilia", "césar", "clara", "cristina", "david", "dolores", "diana", "daniel", "diego", "elena", "esteban", "eva", "eduardo", "emma", "fabián", "fatima", "fernando", "felipe", "florencia", "gabriel", "gloria", "gonzalo", "graciela", "guillermo", "hugo", "helena", "héctor", "hilda", "horacio", "ignacio", "irene", "isabel", "iván", "inés", "javier", "jimena", "juan", "julia", "jorge", "karla", "kevin", "karina", "kike", "katia", "luis", "laura", "lucía", "leonardo", "leticia", "manuel", "maría", "marta", "miguel", "mónica", "natalia", "nicolás", "noelia", "nuria", "norma", "óscar", "olivia", "omar", "olga", "osvaldo", "pablo", "paula", "pedro", "patricia", "pilar", "quintín", "juana", "roberto", "raquel", "rosa", "ricardo", "rita", "santiago", "sofía", "susana", "sergio", "silvia", "tomás", "teresa", "tatiana", "teodoro", "trinidad", "ursula", "unai", "ulises", "valentina", "victor", "vanesa", "vicente", "verónica", "walter", "wendy", "wanda", "wilson", "wilfredo", "xavier", "ximena", "xenon", "yolanda", "yasmin", "yago", "yanina", "isidro", "zoe", "zacarías", "zulema", "zenón"],
    lugar: ["alemania", "argentina", "atenas", "alicante", "albacete", "brasil", "bogotá", "barcelona", "bilbao", "berlín", "canadá", "china", "copenhague", "córdoba", "caracas", "dinamarca", "dublín", "dinant", "ecuador", "españa", "estocolmo", "edimburgo", "egipto", "francia", "finlandia", "florencia", "fiyi", "filipinas", "grecia", "guatemala", "ginebra", "granada", "guadalajara", "holanda", "honduras", "helsinki", "hungría", "hamburgo", "italia", "irlanda", "islandia", "indonesia", "india", "japón", "jamaica", "jerusalén", "jaén", "jordania", "kenia", "kuwait", "kiev", "kioto", "kazajistán", "libia", "lisboa", "londres", "lima", "luxemburgo", "méxico", "madrid", "moscú", "málaga", "marrakech", "noruega", "nairobi", "nueva york", "nicosia", "nepal", "oslo", "ottawa", "omán", "oporto", "oxford", "parís", "perú", "praga", "panamá", "palermo", "qatar", "quito", "quebec", "rumanía", "roma", "rusia", "rio de janeiro", "rotterdam", "suecia", "suiza", "santiago", "sevilla", "singapur", "tokio", "turquía", "toronto", "toledo", "tailandia", "uruguay", "ucrania", "utrecht", "venecia", "vietnam", "varsovia", "valencia", "viena", "washington", "wellington", "xalapa", "yemen", "yakarta", "zagreb", "zimbabue", "zaragoza", "zurich"],
    animal: ["araña", "águila", "avispa", "avestruz", "alce", "búho", "ballena", "buitre", "bisonte", "burro", "caballo", "canguro", "cocodrilo", "cucaracha", "camello", "delfín", "dromedario", "dragón de komodo", "diablo de tasmania", "elefante", "erizo", "escorpión", "estrella de mar", "escarabajo", "foca", "flamenco", "faisán", "gato", "gacela", "gorila", "gusano", "gallina", "halcón", "hiena", "hipopótamo", "hormiga", "hurón", "iguana", "impala", "insecto palo", "jaguar", "jabalí", "jirafa", "jilguero", "koala", "krill", "kiwi", "león", "loro", "lobo", "libélula", "leopardo", "mapache", "mariposa", "medusa", "murciélago", "mantis", "nutria", "ñu", "ñandú", "orangután", "oso", "orca", "oveja", "ostra", "perro", "pingüino", "pantera", "pato", "perezoso", "quetzal", "quirquincho", "rana", "ratón", "rinoceronte", "reno", "ruiseñor", "serpiente", "sapo", "salamandra", "salmón", "saltamontes", "tiburón", "tigre", "tortuga", "topo", "tucán", "urraca", "urogallo", "vaca", "vicuña", "víbora", "vampiro", "wallaby", "wombat", "xoloitzcuintle", "yak", "yegua", "zorro", "zopilote", "cebra", "ciervo"],
    objeto: ["anillo", "aguja", "arco", "altavoz", "armario", "barco", "botella", "brújula", "bombilla", "bandeja", "cámara", "cuchillo", "copa", "cinturón", "cuadro", "dado", "destornillador", "diamante", "disco", "dron", "escalera", "escoba", "espejo", "estufa", "espada", "flauta", "flecha", "foco", "florero", "frasco", "guitarra", "gafas", "globo", "grapa", "guante", "hacha", "hilo", "horno", "herradura", "imán", "impresora", "imperdible", "jarrón", "jeringa", "juguete", "joya", "jabón", "lámpara", "lápiz", "libro", "lupa", "linterna", "martillo", "mesa", "micrófono", "moneda", "mochila", "nube", "navaja", "ordenador", "olla", "orinal", "paraguas", "pelota", "piano", "peine", "plato", "queso", "quemador", "reloj", "regla", "rueda", "radio", "rastrillo", "silla", "sofá", "sombrero", "sartén", "sello", "teléfono", "tijeras", "tambor", "taza", "taladro", "uniforme", "usb", "ukelele", "violín", "vela", "ventana", "vaso", "ventilador", "xilófono", "yoyo", "zapato", "zapatilla", "zanja"],
    color: ["azul", "amarillo", "añil", "amatista", "ámbar", "blanco", "beige", "burdeos", "bronce", "cian", "carmesí", "castaño", "caoba", "crema", "dorado", "esmeralda", "escarlata", "fucsia", "grana", "gris", "grafito", "hueso", "índigo", "jade", "kaki", "lavanda", "lila", "marrón", "magenta", "marfil", "malva", "naranja", "negro", "nácar", "ocre", "oro", "púrpura", "plata", "perla", "pistacho", "rojo", "rosa", "salmón", "sepia", "turquesa", "terracota", "trigo", "ultramar", "verde", "violeta", "vino", "wengue", "xantico", "zafiro"],
    fruta: ["arándano", "albaricoque", "aceituna", "ananá", "avellana", "banana", "cereza", "ciruela", "coco", "chirimoya", "dátil", "durazno", "damasco", "frambuesa", "fresa", "frutilla", "granada", "guayaba", "grosella", "higo", "higo chumbo", "kiwi", "kumquat", "kinoto", "limón", "lima", "lichi", "mandarina", "manzana", "melón", "mango", "maracuyá", "mora", "naranja", "nectarina", "níspero", "nuez", "papaya", "pera", "piña", "plátano", "pomelo", "paraguaya", "quinoto", "sandía", "tamarindo", "toronja", "tuna", "uva"],
    marca: ["adidas", "audi", "apple", "amazon", "ariel", "bic", "bosch", "bayer", "barbie", "boeing", "casio", "chanel", "cocacola", "colgate", "canon", "dior", "dell", "disney", "danone", "durex", "ebay", "elle", "esso", "fila", "ford", "ferrari", "facebook", "fedex", "gucci", "google", "gillette", "general electric", "hp", "honda", "heineken", "hollywood", "ibm", "ikea", "intel", "instagram", "jaguar", "jeep", "john deere", "kodak", "kia", "kellogg's", "kfc", "lego", "levi's", "lg", "l'oréal", "lamborghini", "microsoft", "mercedes", "motorola", "mcdonald's", "marvel", "nike", "nintendo", "nestlé", "netflix", "nasa", "omega", "oracle", "oral-b", "pepsi", "prada", "puma", "porsche", "playstation", "quick", "rolex", "ray-ban", "reebok", "red bull", "samsung", "sony", "sega", "shell", "starbucks", "toyota", "tesla", "tissot", "tiktok", "twitter", "uber", "umbro", "unilever", "under armour", "visa", "volkswagen", "versace", "vodafone", "walmart", "wikipedia", "whatsapp", "xbox", "xiaomi", "xerox", "yahoo", "youtube", "yamaha", "zara", "zoom", "zalando"],
  };

  for (const playerResponse of input.playerResponses) {
    const categoryLower = playerResponse.category.toLowerCase();
    const playerWord = playerResponse.word || '';
    const playerWordLower = playerWord.toLowerCase().trim();
    const categoryDictionary = aiDictionary[categoryLower] || [];
    
    // Lógica mejorada para la IA
    let aiWord = '';
    const possibleAiWords = categoryDictionary.filter(w => w.startsWith(letterLower));
    
    // La IA tiene un 85% de probabilidad de saber una palabra si hay alguna disponible.
    if (Math.random() < 0.85 && possibleAiWords.length > 0) { 
        aiWord = possibleAiWords[Math.floor(Math.random() * possibleAiWords.length)];
    }
    const aiWordLower = aiWord.toLowerCase().trim();
    
    // *** LÓGICA DE VALIDACIÓN Y PUNTUACIÓN (MÁS ESTRICTA) ***

    // 1. Validar palabra del jugador y de la IA
    // Una palabra es válida si:
    // - Tiene más de 1 caracter.
    // - Empieza con la letra correcta.
    // - Existe en nuestro diccionario.
    const isPlayerWordValid = 
        playerWordLower.length > 1 &&
        playerWordLower.startsWith(letterLower) &&
        categoryDictionary.includes(playerWordLower);

    const isAiWordValid =
        aiWordLower.length > 1 &&
        aiWordLower.startsWith(letterLower) &&
        categoryDictionary.includes(aiWordLower);

    // 2. Calcular puntuaciones
    let playerScore = 0;
    let aiScore = 0;

    if (isPlayerWordValid && isAiWordValid) {
        if (playerWordLower === aiWordLower) {
            // Ambos aciertan con la misma palabra
            playerScore = 5;
            aiScore = 5;
        } else {
            // Ambos aciertan con palabras diferentes
            playerScore = 10;
            aiScore = 10;
        }
    } else if (isPlayerWordValid) {
        // Solo el jugador acierta
        playerScore = 10;
        aiScore = 0;
    } else if (isAiWordValid) {
        // Solo la IA acierta
        playerScore = 0;
        aiScore = 10;
    }
    // Si ninguno acierta, ambos scores son 0.
    
    // 3. Guardar resultados para la categoría
    results[playerResponse.category] = {
      player: {
        response: playerWord,
        isValid: isPlayerWordValid,
        score: playerScore,
      },
      ai: {
        response: aiWord ? aiWord.charAt(0).toUpperCase() + aiWord.slice(1) : '',
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
  // Ahora llamamos directamente a la función local en lugar de cualquier cosa relacionada con la IA
  return await localEvaluateRound(input);
}
