import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CutLink — Shorten & Share',
  description: 'Fast link shortener with QR code generation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mesh" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}