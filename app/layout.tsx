import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Espire AI Conversations",
  description: "Conversational AI search grounded in your Sitecore content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Open Sans — espire.com primary font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=Merriweather:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
