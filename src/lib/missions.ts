// src/lib/missions.ts
import type { GameResult } from "@/components/game/types";

export interface Mission {
    id: 'win_games' | 'play_games' | 'score_high' | 'play_multiplayer' | 'get_perfect_score' | 'win_streak';
    description: string;
    goal: number;
    reward: number;
    icon: string;
}

export interface MissionProgress extends Mission {
    progress: number;
    claimed: boolean;
}

const ALL_MISSIONS: Mission[] = [
    { id: 'win_games', description: 'Gana 3 partidas', goal: 3, reward: 50, icon: '🏆' },
    { id: 'play_games', description: 'Juega 5 partidas', goal: 5, reward: 25, icon: '🎮' },
    { id: 'score_high', description: 'Consigue 50 puntos en una sola ronda', goal: 50, reward: 75, icon: '🚀' },
    { id: 'play_multiplayer', description: 'Juega 2 partidas multijugador', goal: 2, reward: 40, icon: '👥' },
    { id: 'get_perfect_score', description: 'Consigue una puntuación perfecta (100 pts)', goal: 100, reward: 150, icon: '💯' },
    { id: 'win_streak', description: 'Consigue una racha de 2 victorias', goal: 2, reward: 100, icon: '🔥' },
];

// Select 3 random missions for the day
export const getDailyMissions = (): MissionProgress[] => {
    const shuffled = [...ALL_MISSIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(mission => ({
        ...mission,
        progress: 0,
        claimed: false
    }));
};

export const checkMissions = (currentMissions: MissionProgress[], gameResult: Omit<GameResult, 'id' | 'timestamp'> & { won: boolean }): MissionProgress[] => {
    if (!currentMissions) return [];

    return currentMissions.map(mission => {
        if (mission.claimed) return mission;

        let newProgress = mission.progress;
        switch (mission.id) {
            case 'win_games':
                if (gameResult.won) newProgress += 1;
                break;
            case 'play_games':
                newProgress += 1;
                break;
            case 'score_high':
                newProgress = Math.max(newProgress, gameResult.score);
                break;
            case 'play_multiplayer':
                if (gameResult.gameMode === 'multiplayer' || gameResult.gameMode === 'private') {
                    newProgress += 1;
                }
                break;
            case 'get_perfect_score':
                 if (gameResult.score >= 100) { // Assuming perfect is 100 for now
                    newProgress = mission.goal;
                }
                break;
            case 'win_streak':
                // This is more complex and would need to track streak outside this function
                // For now, we can increment if won
                if (gameResult.won) {
                    newProgress += 1; // Simplified
                } else {
                    newProgress = 0; // Reset streak on loss
                }
                break;
        }

        return { ...mission, progress: Math.min(newProgress, mission.goal) };
    });
};
