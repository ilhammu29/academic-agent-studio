import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academic & Proposal Agent Studio — AI Tools Suite",
  description: "Platform AI Agentik Khusus Perancangan Proposal Magang, Skripsi, dan Penelitian Akademik Berbasis Standar Presisi Tinggi & 12 Metode Berpikir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-matte-bg text-milk-white min-h-screen selection:bg-champagne/20 selection:text-champagne-light">
        {children}
      </body>
    </html>
  );
}
