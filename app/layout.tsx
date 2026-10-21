import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academic & Proposal Agent Studio — Full AI Tools Suite",
  description: "Platform AI Agentik Khusus Perancangan Proposal Magang Industri, Skripsi, dan Penelitian Akademik Berbasis Standar Presisi Tinggi & 12 Metode Berpikir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-matte-bg text-milk-white min-h-screen selection:bg-electric-cyan/20 selection:text-white font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
