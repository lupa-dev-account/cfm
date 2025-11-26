import type { Metadata } from "next";
import Script from "next/script";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "CFM - Digital Business Cards",
  description: "Multi-tenant SaaS platform for digital business cards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://elfsightcdn.com/platform.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
        <div className="elfsight-app-c4232d46-680e-4396-b4a8-dcdc0cdcc52e" data-elfsight-app-lazy></div>
      </body>
    </html>
  );
}

