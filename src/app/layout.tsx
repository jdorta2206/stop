
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
          
          <meta name="theme-color" content="#ef4444" />
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
