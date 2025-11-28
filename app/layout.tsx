import type { Metadata } from "next";
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
  // Next.js requires html/body tags in root layout
  // The locale-specific attributes (lang, dir) are set in app/[locale]/layout.tsx
  return (
    <html suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}

