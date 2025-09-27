
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/language-context";
import { useAuth } from "../../hooks/use-auth-context";
import { Button } from "../../components/ui/button";
import { AppHeader } from "../../components/layout/header";
import { AppFooter } from "../../components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/card";
import { Loader2, ShieldCheck, Trash2, Users, BarChart2 } from "lucide-react";
import { rankingManager, type PlayerScore } from "../../lib/ranking";
import { toast } from "sonner";

export default function AdminPage() {
    const { language } = useLanguage();
    const { user, loading: authLoading } = useAuth();

    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<PlayerScore[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, gamesPlayedToday: 0 });

    const fetchAdminData = async () => {
        try {
            const allUsers = await rankingManager.getTopRankings(100); // Fetch top 100 users
            setUsers(allUsers);
            setStats({
                totalUsers: allUsers.length,
                gamesPlayedToday: 0 // Placeholder, this would require more complex querying
            });
        } catch (error) {
            toast.error("No se pudieron cargar los datos del administrador.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (user?.email === 'jdorta2206@gmail.com') {
                setIsAdmin(true);
                fetchAdminData();
            } else {
                setIsLoading(false);
            }
        }
    }, [user, authLoading]);

    const handleBanUser = (userId: string) => {
        toast.error(`La lógica para banear al usuario ${userId} aún no está conectada.`);
    };

    if (isLoading || authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-grow flex items-center justify-center text-center">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
                            <CardDescription>No tienes permisos para ver esta página.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => window.history.back()}>Volver</Button>
                        </CardContent>
                    </Card>
                </main>
                <AppFooter language={language} />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <AppHeader />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-primary"><ShieldCheck /> Panel de Administración</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Partidas Hoy</CardTitle>
                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.gamesPlayedToday}</div>
                             <p className="text-xs text-muted-foreground">(Funcionalidad pendiente)</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Gestión de Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Puntuación Total</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nivel</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{u.playerName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{u.totalScore}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{u.level}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button variant="ghost" size="sm" onClick={() => handleBanUser(u.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4 mr-2" /> Banear</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <AppFooter language={language} />
        </div>
    );
}
