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
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history) history.scrollRestoration = 'manual'; window.scrollTo(0,0);`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
