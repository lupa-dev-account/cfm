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
  // Root layout just returns children
  // The actual html/body wrapper is in app/[locale]/layout.tsx
  return children;
}

