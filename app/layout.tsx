import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque, Silkscreen } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Sun Seeker - Find sunny cafes in Berlin",
  description: "Chase the sun. Find Berlin's sunniest cafe terraces — right now and by the hour.",
  openGraph: {
    title: "Sun Seeker",
    description: "Find sunny cafes in Berlin",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2D1B1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} ${silkscreen.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
