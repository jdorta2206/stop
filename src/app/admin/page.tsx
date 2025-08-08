
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, ShieldCheck, Trash2, Users, BarChart2 } from 'lucide-react';

// Mock data for admin panel
const MOCK_USERS = [
    { id: '1', name: 'Alice', email: 'alice@example.com', score: 1250, games: 15, status: 'active' },
    { id: '2', name: 'Bob', email: 'bob@example.com', score: 800, games: 10, status: 'active' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', score: 2500, games: 25, status: 'banned' },
];

const MOCK_STATS = {
    totalUsers: 150,
    onlineUsers: 25,
    gamesPlayedToday: 340,
    averageScore: 115,
};

export default function AdminPage() {
    const { language, translate } = useLanguage();
    const { user, isLoading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // This would in a real app check against a 'roles' collection in Firestore
    useEffect(() => {
        if (!authLoading) {
            if ((user as { email?: string })?.email === 'jdorta2206@gmail.com') {
                setIsAdmin(true);
              }  
                        setIsLoading(false);
        }
    }, [user, authLoading]);

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
                <AppHeader onToggleChat={() => {}} isChatOpen={false} />
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
            <AppHeader onToggleChat={() => {}} isChatOpen={false} />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-primary"><ShieldCheck /> Panel de Administración</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{MOCK_STATS.totalUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Partidas Hoy</CardTitle>
                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{MOCK_STATS.gamesPlayedToday}</div>
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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Puntuación</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {MOCK_USERS.map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{u.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{u.score}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4 mr-2" /> Banear</Button>
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
