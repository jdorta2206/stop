// src/components/missions/MissionItem.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { MissionProgress } from "@/lib/missions";
import { Check, Coins } from "lucide-react";
import { useState } from "react";

interface MissionItemProps {
    mission: MissionProgress;
    onClaim: (missionId: string) => void;
}

export function MissionItem({ mission, onClaim }: MissionItemProps) {
    const [isClaiming, setIsClaiming] = useState(false);
    const isCompleted = mission.progress >= mission.goal;

    const handleClaimClick = async () => {
        setIsClaiming(true);
        await onClaim(mission.id);
        setIsClaiming(false);
    };

    return (
        <div className="flex items-center gap-4 p-3 bg-card/50 rounded-lg border">
            <div className="text-4xl">{mission.icon}</div>
            <div className="flex-grow">
                <p className="font-semibold">{mission.description}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Progress value={(mission.progress / mission.goal) * 100} className="h-2 w-full" />
                    <span className="text-xs font-mono text-muted-foreground">
                        {mission.progress}/{mission.goal}
                    </span>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center w-28">
                {mission.claimed ? (
                    <div className="flex items-center gap-1 text-green-500">
                        <Check className="h-5 w-5" />
                        <span className="font-bold">Reclamado</span>
                    </div>
                ) : isCompleted ? (
                    <Button onClick={handleClaimClick} disabled={isClaiming} size="sm">
                        Reclamar <Coins className="ml-2 h-4 w-4" /> {mission.reward}
                    </Button>
                ) : (
                     <div className="flex items-center gap-1 text-yellow-500">
                        <Coins className="h-5 w-5" />
                        <span className="font-bold">{mission.reward}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

    