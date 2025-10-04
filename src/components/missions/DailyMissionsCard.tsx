
// src/components/missions/DailyMissionsCard.tsx
"use client";

import { useUser } from '../../firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MissionItem } from "./MissionItem";
import { Loader2, Gift } from "lucide-react";
import { rankingManager } from "../../lib/ranking";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { MissionProgress } from "../../lib/missions";

export function DailyMissionsCard() {
    const { user } = useUser();
    const [missions, setMissions] = useState<MissionProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMissions = async () => {
        if (user) {
            setIsLoading(true);
            const playerData = await rankingManager.getPlayerRanking(user.uid);
            setMissions(playerData?.dailyMissions || []);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(user) {
            fetchMissions();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const handleClaim = async (missionId: string) => {
        if (!user) return;
        try {
            await rankingManager.claimMissionReward(user.uid, missionId);
            toast.success("Has recibido tus monedas.", { description: "¡Recompensa Reclamada!" });
            fetchMissions(); // Refresh missions state
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    if (!user) return null;

    return (
        <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Gift className="h-6 w-6 text-primary" />
                    Misiones Diarias
                </CardTitle>
                <CardDescription>Completa estas tareas para ganar recompensas. ¡Se reinician cada día!</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {missions.length > 0 ? missions.map(mission => (
                            <MissionItem key={mission.id} mission={mission} onClaim={handleClaim} />
                        )) : (
                            <p className="text-center text-muted-foreground">No hay misiones diarias disponibles.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
