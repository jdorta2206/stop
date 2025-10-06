
export type GameState = 'IDLE' | 'SPINNING' | 'PLAYING' | 'EVALUATING' | 'RESULTS';

export type GameMode = 'solo' | 'multiplayer';

export type LanguageCode = 'en' | 'es' | 'fr' | 'pt';

export type PlayerResponseSet = Record<string, string>;

// Represents the responses of ALL players for a round
// e.g., { "player1_id": { "CategoryA": "WordA" }, "player2_id": { "CategoryA": "WordB" } }
export type PlayerResponses = Record<string, PlayerResponseSet>;

export interface ResultDetail {
    response: string;
    score: number;
    isValid: boolean;
}

// Represents the results for a SINGLE player for a round
// e.g., { "CategoryA": { response: "WordA", score: 10, isValid: true } }
export type SinglePlayerRoundResults = Record<string, ResultDetail>;


// Represents the results of ALL players for a round, keyed by player ID.
// e.g., { "player1_id": { "CategoryA": { ... } }, "player2_id": { "CategoryA": { ... } } }
export type RoundResults = Record<string, SinglePlayerRoundResults>;

    