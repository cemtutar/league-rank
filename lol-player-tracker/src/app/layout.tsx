import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LoL Player Tracker',
  description: 'Track League of Legends players across matches and regions.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-primary text-white">
      <body className="min-h-screen">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12">
          <header className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-bold text-accent">LoL Player Tracker</h1>
            <p className="text-sm text-gray-200">Search a summoner to see their latest ranked performance.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
