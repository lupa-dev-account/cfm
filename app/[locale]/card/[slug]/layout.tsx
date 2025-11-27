import type { Metadata, Viewport } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = await createClient();

  // Fetch card data for metadata
  const { data: card } = await supabase
    .from("employee_cards")
    .select("theme")
    .eq("public_slug", slug)
    .eq("is_active", true)
    .single();

  const theme = ((card as any)?.theme as any) || {};
  const cardOwnerName = theme?.name || "CFM Card";

  return {
    title: cardOwnerName,
    description: `Digital Business Card - ${cardOwnerName}`,
    manifest: `/${locale}/card/${slug}/manifest.json`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: cardOwnerName,
    },
    icons: {
      icon: "https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg",
      apple: "https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#16a34a", // green-600
};

export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
