import type { Metadata } from "next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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
      <body>
        <LanguageSwitcher />
        {children}
      </body>
    </html>
  );
}

