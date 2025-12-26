import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nepali Imposter Game",
  description: "Light pink Nepali imposter game setup",
  icons: {
    icon: "/nepali-imposter-logo.png",
    apple: "/nepali-imposter-logo.png",
    shortcut: "/nepali-imposter-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
