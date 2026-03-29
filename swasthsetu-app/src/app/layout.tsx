import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SwasthSetu AI — Care Continuity Platform",
  description:
    "A centralized rural healthcare platform enabling doctors to access patient medical history across hospitals with consented record retrieval.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        style={{
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, system-ui, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}

