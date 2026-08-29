import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '卓球プレー分析システム | Table Tennis Analytics',
  description: '1プレー単位で得失点要因を記録し、相手の戦型別・技術別・コース別にリアルタイム分析するシステム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full bg-slate-50">
      <body className="min-h-full flex flex-col antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
