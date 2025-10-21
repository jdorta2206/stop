
// src/lib/ranking.ts
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs, 
    updateDoc, 
    increment, 
    serverTimestamp,
    addDoc,
    Timestamp,
    writeBatch
} from "firebase/firestore";
import { checkMissions, getDailyMissions, type MissionProgress } from './missions';
import { initializeFirebase } from '../firebase';

export interface PlayerScore {
  id: string;
  playerName: string;
  photoURL?: string | null;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  averageScore: number;
  bestScore: number;
  lastPlayed: any; // Can be Firestore Timestamp on server, string on client
  level: string;
  achievements: string[];
  coins: number;
  dailyMissions: MissionProgress[];
  missionsLastReset: string; // YYYY-MM-DD
}

export interface GameResult {
    id: string;
    playerId: string;
    playerName: string;
    photoURL?: string | null;
    score: number;
    categories: Record<string, string>;
    letter: string;
    gameMode: 'solo' | 'multiplayer' | 'private';
    roomId?: string;
    timestamp: any; // Can be Firestore Timestamp on server, Date on client
    won: boolean;
}

const LEVELS = [
  { name: 'Principiante', minScore: 0, color: '#94a3b8' },
  { name: 'Novato', minScore: 1000, color: '#3b82f6' },
  { name: 'Intermedio', minScore: 5000, color: '#10b981' },
  { name: 'Avanzado', minScore: 15000, color: '#f59e0b' },
  { name: 'Experto', minScore: 30000, color: '#ef4444' },
  { name: 'Maestro', minScore: 50000, color: '#8b5cf6' },
  { name: 'Leyenda', minScore: 100000, color: '#f97316' }
];

export const ACHIEVEMENTS: Record<string, { name: string; description: string; icon: string }> = {
  'first_win': { name: 'Primera Victoria', description: 'Gana tu primer juego', icon: '🏆' },
  'perfect_game': { name: 'Juego Perfecto', description: 'Completa todas las categorías en una ronda', icon: '💯' },
  'speed_demon': { name: 'Demonio de la Velocidad', description: 'Gana una ronda en menos de 20 segundos', icon: '⚡' },
  'word_master': { name: 'Maestro de Palabras', description: 'Acumula 10,000 puntos totales', icon: '📚' },
  'consistent_player': { name: 'Jugador Consistente', description: 'Juega 25 partidas', icon: '🎯' },
  'high_scorer': { name: 'Puntuación Alta', description: 'Obtén más de 50 puntos en una sola ronda', icon: '🚀' },
  'champion': { name: 'Campeón', description: 'Gana 10 juegos', icon: '👑' }
};

// Cantidad de monedas a otorgar
const COINS_PER_GAME = 10;
const COINS_PER_WIN_MULTIPLIER = 3; // Gana 3 veces más si gana la partida

class RankingManager {
  private db = initializeFirebase().firestore;
  private rankingsCollection = collection(this.db, 'rankings');

  async getPlayerRanking(
    playerId: string,
    displayName?: string | null,
    photoURL?: string | null
  ): Promise<PlayerScore> {
    if (!playerId) {
      throw new Error("getPlayerRanking requiere un playerId válido.");
    }
    const playerDocRef = doc(this.rankingsCollection, playerId);
    
    let docSnap = await getDoc(playerDocRef);

    if (!docSnap.exists()) {
      const finalDisplayName = displayName || 'Jugador Anónimo';
      const finalPhotoURL = photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(finalDisplayName)}`;
      
      const newPlayer: Omit<PlayerScore, 'id'> = {
          playerName: finalDisplayName,
          photoURL: finalPhotoURL,
          totalScore: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          averageScore: 0,
          bestScore: 0,
          lastPlayed: Timestamp.now(), // FIX: Use Timestamp.now() instead of serverTimestamp() here
          level: this.calculateLevel(0),
          achievements: [],
          coins: 50, // Monedas iniciales
          dailyMissions: getDailyMissions(),
          missionsLastReset: new Date().toISOString().split('T')[0],
      };
      await setDoc(playerDocRef, newPlayer);
      docSnap = await getDoc(playerDocRef);
    }
    
    const playerData = docSnap.data() as Omit<PlayerScore, 'id'>;
    
    const today = new Date().toISOString().split('T')[0];
    if (playerData.missionsLastReset !== today) {
        const newMissions = getDailyMissions();
        await updateDoc(playerDocRef, {
            missionsLastReset: today,
            dailyMissions: newMissions.map(m => ({...m}))
        });
        playerData.dailyMissions = newMissions;
        playerData.missionsLastReset = today;
    }


    return { id: playerId, ...playerData };
  }
  
  async saveGameResult(gameResult: Omit<GameResult, 'timestamp' | 'id'>): Promise<PlayerScore | null> {
    if (!gameResult.playerId) {
        console.error("saveGameResult requires a valid playerId.");
        return null;
    }
    const playerDocRef = doc(this.rankingsCollection, gameResult.playerId);
    const gameHistoryCollectionRef = collection(this.db, `rankings/${gameResult.playerId}/gameHistory`);
    
    const playerRanking = await this.getPlayerRanking(gameResult.playerId, gameResult.playerName, gameResult.photoURL);

    const finalGameResult = { ...gameResult, timestamp: serverTimestamp() };
    await addDoc(gameHistoryCollectionRef, finalGameResult);
    
    const coinsEarned = COINS_PER_GAME * (gameResult.won ? COINS_PER_WIN_MULTIPLIER : 1);

    const newTotalScore = playerRanking.totalScore + gameResult.score;
    const newGamesPlayed = playerRanking.gamesPlayed + 1;

    const updatedPlayerStats = {
        totalScore: newTotalScore,
        gamesPlayed: newGamesPlayed,
        gamesWon: playerRanking.gamesWon + (gameResult.won ? 1 : 0),
        bestScore: Math.max(playerRanking.bestScore, gameResult.score),
        averageScore: Math.round(newTotalScore / newGamesPlayed),
        level: this.calculateLevel(newTotalScore),
    };
    
    const updatedAchievements = this.checkAchievements(playerRanking as PlayerScore, gameResult);
    const updatedMissions = checkMissions(playerRanking.dailyMissions, gameResult);

    const updatedData: Record<string, any> = {
      totalScore: increment(gameResult.score),
      gamesPlayed: increment(1),
      gamesWon: increment(gameResult.won ? 1 : 0),
      bestScore: updatedPlayerStats.bestScore,
      averageScore: updatedPlayerStats.averageScore,
      lastPlayed: serverTimestamp(),
      level: updatedPlayerStats.level,
      achievements: updatedAchievements,
      dailyMissions: updatedMissions.map(m => ({...m})), // Firestore necesita objetos planos
      coins: increment(coinsEarned),
    };

    await updateDoc(playerDocRef, updatedData);
    
    const updatedPlayerDoc = await getDoc(playerDocRef);
    return updatedPlayerDoc.exists() ? { id: updatedPlayerDoc.id, ...updatedPlayerDoc.data() } as PlayerScore : null;
  }

  async claimMissionReward(playerId: string, missionId: string): Promise<void> {
    const playerDocRef = doc(this.rankingsCollection, playerId);
    const player = await this.getPlayerRanking(playerId);

    if (!player || !player.dailyMissions) throw new Error("Jugador o misiones no encontrados");

    const mission = player.dailyMissions.find(m => m.id === missionId);
    if (!mission) throw new Error("Misión no encontrada");
    if (mission.progress < mission.goal) throw new Error("Misión no completada");
    if (mission.claimed) throw new Error("Misión ya reclamada");

    const updatedMissions = player.dailyMissions.map(m => 
      m.id === missionId ? { ...m, claimed: true } : m
    );

    await updateDoc(playerDocRef, {
      coins: increment(mission.reward),
      dailyMissions: updatedMissions.map(m => ({...m}))
    });
  }

  private calculateLevel(totalScore: number): string {
    return LEVELS.slice().reverse().find(l => totalScore >= l.minScore)?.name || 'Principiante';
  }

  private checkAchievements(playerScore: PlayerScore, gameResult: Omit<GameResult, 'id' | 'timestamp'>): string[] {
    const newAchievements = new Set(playerScore.achievements);
    const gamesWon = playerScore.gamesWon + (gameResult.won ? 1 : 0);

    if (gamesWon >= 1) newAchievements.add('first_win');
    if (Object.values(gameResult.categories).every(word => word.trim() !== '')) newAchievements.add('perfect_game');
    if (gameResult.score >= 50) newAchievements.add('high_scorer');
    if (playerScore.totalScore + gameResult.score >= 10000) newAchievements.add('word_master');
    if (playerScore.gamesPlayed + 1 >= 25) newAchievements.add('consistent_player');
    if (gamesWon >= 10) newAchievements.add('champion');

    return Array.from(newAchievements);
  }

  async getGameHistory(playerId: string, historyLimit: number = 5): Promise<GameResult[]> {
    if (!playerId) return [];
    const q = query(collection(this.db, `rankings/${playerId}/gameHistory`), orderBy("timestamp", "desc"), limit(historyLimit));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameResult));
  }

  async getTopRankings(limitCount: number = 50): Promise<PlayerScore[]> {
    const q = query(this.rankingsCollection, orderBy("totalScore", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const players = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlayerScore));
    return players;
  }
}

export const rankingManager = new RankingManager();

export const formatScore = (score: number): string => {
  return score.toLocaleString();
};

export const getLevelColor = (level: string): string => {
  return LEVELS.find(l => l.name === level)?.color || '#94a3b8';
};

export const getAchievementInfo = (achievementId: string) => {
  return ACHIEVEMENTS[achievementId];
};
