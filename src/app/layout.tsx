import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
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
  metadataBase: new URL("https://tcrei.blog"),
  title: { template: "%s | tcrei", default: "tcrei blog" },
  description: "A developer blog platform",
  openGraph: {
    type: "website",
    siteName: "tcrei",
    title: { template: "%s | tcrei", default: "tcrei blog" },
    description: "A developer blog platform",
  },
  twitter: {
    card: "summary_large_image",
    title: { template: "%s | tcrei", default: "tcrei blog" },
    description: "A developer blog platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
