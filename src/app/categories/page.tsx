
"use client";

import { useLanguage } from '@/contexts/language-context';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Gamepad2, BrainCircuit, Lightbulb } from 'lucide-react';

export default function CategoriesPage() {
  const { language, translate } = useLanguage();
  const router = useRouter();

  const categories = [
    { key: 'place', icon: '🌍' },
    { key: 'animal', icon: '🦁' },
    { key: 'name', icon: '👤' },
    { key: 'food', icon: '🍎' },
    { key: 'color', icon: '🎨' },
    { key: 'object', icon: '📦' },
    { key: 'brand', icon: '®️' }
  ];

  const whyPlayFeatures = [
    { key: 'multiplayer', icon: <Gamepad2 className="h-10 w-10 text-primary" /> },
    { key: 'scoringSystem', icon: <BrainCircuit className="h-10 w-10 text-primary" /> },
    { key: 'free', icon: <Lightbulb className="h-10 w-10 text-primary" /> }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <section id="categories" className="mb-12">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-primary">{translate('categories.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                {categories.map(({ key, icon }) => (
                  <div key={key} className="p-4 bg-card-foreground/5 rounded-lg flex flex-col items-center justify-center space-y-2">
                    <span className="text-4xl">{icon}</span>
                    <span className="font-semibold text-foreground">{translate(`categories.list.${key}`)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="why-play">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center text-primary">{translate('categories.whyPlay.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-8">
                        {whyPlayFeatures.map(({key, icon}) => (
                            <div key={key} className="flex flex-col items-center text-center p-4">
                                <div className="p-4 bg-primary/20 rounded-full mb-4">
                                    {icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{translate(`categories.whyPlay.features.${key}.title`)}</h3>
                                <p className="text-muted-foreground">{translate(`categories.whyPlay.features.${key}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>

      </main>
      <AppFooter language={language} />
    </div>
  );
}
