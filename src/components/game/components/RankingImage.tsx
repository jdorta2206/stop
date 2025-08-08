
'use client';

import { Trophy } from 'lucide-react';

interface Player {
  rank: number;
  name: string;
  score: number;
  avatar?: string;
}

interface RankingImageProps {
  players: Player[];
}

export const RankingImage: React.FC<RankingImageProps> = ({ players }) => {
  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-48';
    if (rank === 2) return 'h-36';
    return 'h-24';
  };

  const podiumOrder = [
    players.find(p => p.rank === 2),
    players.find(p => p.rank === 1),
    players.find(p => p.rank === 3),
  ].filter(Boolean) as Player[];

  return (
    <div className="bg-gradient-to-br from-red-600 via-red-500 to-yellow-400 p-8 flex flex-col justify-between" style={{ width: 500, height: 500 }}>
        <div>
            <h1 className="text-5xl font-extrabold text-white text-center mb-1">
                🏆 Ranking Semanal 🏆
            </h1>
            <h2 className="text-3xl font-bold text-yellow-300 text-center">STOP Game</h2>
        </div>

      <div className="flex items-end justify-center gap-4">
        {podiumOrder.map((player) => (
          <div key={player.rank} className="flex flex-col items-center">
            <img src={player.avatar || `https://i.pravatar.cc/150?u=${player.name}`} alt={player.name} className="w-24 h-24 rounded-full border-4 border-yellow-300 mb-2" />
            <h3 className="text-white text-xl font-bold">{player.name}</h3>
            <div className={`flex items-center justify-center rounded-t-lg bg-gray-700/80 w-32 ${getPodiumHeight(player.rank)}`}>
              <div className="text-center text-white">
                <p className="text-4xl font-bold">{player.rank}</p>
                <p className="text-lg font-semibold">{player.score.toLocaleString()} pts</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
