import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Dream Matches | Anime vs. Cartoons, WWE vs. AEW Battle Simulator",
  description: "Experience the ultimate crossover! Watch AI-generated videos of your favorite characters from Anime, Cartoons, WWE, AEW, and Toku fighting each other in epic dream matches.",
  keywords: ["AI Dream Matches", "Anime vs Cartoons", "WWE vs AEW", "AI Video Generation", "Character Battle Simulator", "Kling AI", "Dream Match Video"],
  openGraph: {
    title: "AI Dream Matches | Epic Crossover Battle Simulator",
    description: "Generate and watch epic battles between legends from different universes using advanced AI video technology.",
    url: "https://dream-matches.com",
    siteName: "Dream Matches",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dream Matches AI Battle Simulator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Dream Matches | Epic Crossover Battle Simulator",
    description: "Watch your favorite characters fight in AI-generated dream matches!",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
