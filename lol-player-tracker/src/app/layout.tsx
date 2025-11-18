import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PoroMetrics',
  description: 'Track League of Legends players across matches and regions.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-slate-950 text-white">
      <body className="min-h-screen app-bg">
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
          <header className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full border border-slate-800/70 bg-slate-900/60 px-4 py-1 text-xs uppercase tracking-[0.35em] text-slate-300">
              League of Legends insights
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Poro <span className="text-accent">Metrics</span>
              </h1>
              <p className="text-base text-slate-300 sm:text-lg">
                Discover how you or your friends perform in recent ranked matches across every supported region.
              </p>
            </div>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
