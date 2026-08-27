import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NormAI — AI Certification Co-Pilot | Indian Standards & BIS Services (SIH 2026)',
  description: 'Clean, modern AI compliance platform for Indian Standards (IS), Bureau of Indian Standards (BIS) certification, pre-audit gap checks, and source-backed regulatory guidance.',
  keywords: ['NormAI', 'BIS', 'Bureau of Indian Standards', 'ISI Mark', 'Smart India Hackathon', 'SIH 2026', 'PS 26107', 'Indian Standards', 'IS 302', 'Compliance', 'MSME Certification'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#F7FAFC]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-app-bg text-text-dark min-h-screen">
        {children}
      </body>
    </html>
  );
}
