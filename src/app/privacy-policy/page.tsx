
"use client";

import { AppHeader } from '../../components/layout/header';
import { AppFooter } from '../../components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useLanguage } from '../../contexts/language-context';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Política de Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p><strong>Última actualización:</strong> 23 de Septiembre de 2025</p>

            <h2 className="text-xl font-semibold pt-4">1. Introducción</h2>
            <p>
              Bienvenido a Stop Game. Nos comprometemos a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestra aplicación.
            </p>

            <h2 className="text-xl font-semibold pt-4">2. Información que Recopilamos</h2>
            <p>
              Recopilamos la siguiente información para proporcionar y mejorar nuestro servicio:
              <ul>
                <li className="ml-6 list-disc"><strong>Información de autenticación:</strong> Cuando inicias sesión con Google o Facebook, recibimos tu nombre, dirección de correo electrónico y URL de foto de perfil, según lo proporcionado por el proveedor de autenticación.</li>
                <li className="ml-6 list-disc"><strong>Datos del juego:</strong> Almacenamos tus puntuaciones, historial de partidas, nivel y logros para mantener tu progreso y mostrarlo en los rankings.</li>
              </ul>
            </p>

            <h2 className="text-xl font-semibold pt-4">3. Cómo Usamos tu Información</h2>
            <p>
              Usamos la información que recopilamos para:
              <ul>
                <li className="ml-6 list-disc">Personalizar tu experiencia de juego.</li>
                <li className="ml-6 list-disc">Gestionar tu cuenta y tu progreso.</li>
                <li className="ml-6 list-disc">Habilitar funciones multijugador, como salas privadas y rankings.</li>
                <li className="ml-6 list-disc">Garantizar la seguridad y el funcionamiento de la aplicación.</li>
              </ul>
            </p>

            <h2 className="text-xl font-semibold pt-4">4. No compartimos tus datos</h2>
            <p>
              No vendemos ni compartimos tu información personal con terceros para fines de marketing. Tu información solo se utiliza para el funcionamiento interno de la aplicación.
            </p>
            
            <h2 className="text-xl font-semibold pt-4">5. Seguridad de los Datos</h2>
            <p>
              Utilizamos los servicios de Firebase de Google, que implementan medidas de seguridad estándar de la industria para proteger tus datos. Sin embargo, ningún método de transmisión por Internet es 100% seguro.
            </p>
            
            <h2 className="text-xl font-semibold pt-4">6. Contáctanos</h2>
            <p>
              Si tienes alguna pregunta sobre esta Política de Privacidad, puedes contactarnos en jdorta2206@gmail.com.
            </p>
          </CardContent>
        </Card>
      </main>
      <AppFooter language={language} />
    </div>
  );
}
