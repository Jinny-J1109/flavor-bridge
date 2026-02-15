import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Flavor Bridge",
  description:
    "Scan any restaurant menu and instantly understand every dish — with photos, pronunciation, and flavor profiles.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Flavor Bridge",
    description:
      "Scan any restaurant menu and instantly understand every dish.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} font-sans antialiased bg-gray-50 text-gray-900 min-h-screen`}
      >
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-orange-500">
              Flavor Bridge
            </a>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
