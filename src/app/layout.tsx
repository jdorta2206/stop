
import './globals.css';
import { Providers } from '../components/providers/Providers';
import { FirebaseClientProvider } from '../firebase/client-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#C0474A" />
      </head>
      <body className="flex flex-col h-full bg-background text-foreground">
        <FirebaseClientProvider>
          <Providers>
            {children}
          </Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
