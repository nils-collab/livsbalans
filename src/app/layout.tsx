import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

// Force all pages to be dynamic to avoid build-time errors with env vars
export const dynamic = 'force-dynamic';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Livsbalans",
  description: "Bedöm din livssituation, identifiera orsaker och skapa en målbild för en bättre livsbalans",
  manifest: "/manifest.json",
  themeColor: "#125E6A",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Livsbalans",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="light">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
