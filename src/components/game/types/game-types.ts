export type GameState = 'IDLE' | 'SPINNING' | 'PLAYING' | 'EVALUATING' | 'RESULTS';

export type GameMode = 'solo' | 'multiplayer';

export type LanguageCode = 'en' | 'es' | 'fr' | 'pt';

export type PlayerResponseSet = Record<string, string>;

export type PlayerResponses = Record<string, PlayerResponseSet>;

export interface ResultDetail {
    response: string;
    score: number;
    isValid: boolean;
}

// Objeto que mapea nombres de categoría a sus resultados
export type RoundResults = Record<string, {
    player: ResultDetail;
    ai: ResultDetail;
}>;
