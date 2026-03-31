import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'SwasthSetu AI - Care Continuity Platform',
  description:
    'A centralized rural healthcare platform enabling doctors to access patient medical history across hospitals with consented record retrieval.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body suppressHydrationWarning className={`${nunitoSans.variable} app-root`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '14px',
              fontSize: '14px',
              fontFamily: 'var(--font-nunito), "Segoe UI", sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
