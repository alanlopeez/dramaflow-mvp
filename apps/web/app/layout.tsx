import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/ui/Navbar';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';

export const metadata: Metadata = {
  title: 'DramaFlow AI — Generador de Minidramas Virales para TikTok',
  description: 'Creá minidramas verticales 9:16 de alta retención para TikTok y Reels en menos de 60 segundos con Vertex AI, Whisper y voces neuronales.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  other: {
    google: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className="dark notranslate" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="bg-[#0F0F13] text-white min-h-screen flex flex-col antialiased selection:bg-violet-500 selection:text-white notranslate" translate="no" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 flex flex-col pb-20 md:pb-0">{children}</main>
        <MobileBottomNav />
      </body>
    </html>
  );
}
