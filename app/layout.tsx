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
  title: "Safe Card Pilot | Application Intake",
  description:
    "Safe Card MVP pilot: mobile-first referral and application intake. Iteration 01.",
  icons: [{ rel: "icon", type: "image/svg+xml", url: "/favicon.svg" }],
  openGraph: {
    title: "Safe Card Pilot",
    description:
      "Proteksyon na naiintindihan mo, sa isang tap. Safe Card application intake pilot.",
    images: [{ url: "/assets/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Safe Card Pilot",
    description:
      "Proteksyon na naiintindihan mo, sa isang tap. Safe Card application intake pilot.",
    images: ["/assets/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
