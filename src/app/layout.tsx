import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Cursor from "@/components/Cursor/Cursor";
import HeroBackground from "@/components/HeroBackground/HeroBackground";
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
  title: "Studio Seraph — Award-winning interactive production studio",
  description:
    "Award-winning motion, design and interactive experiences connecting culture, technology, and contemporary aesthetics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#111111" />
        <style dangerouslySetInnerHTML={{ __html: `html,body{background:#111!important}` }} />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history) history.scrollRestoration = 'manual'; window.scrollTo(0,0);`,
          }}
        />
        <HeroBackground />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
