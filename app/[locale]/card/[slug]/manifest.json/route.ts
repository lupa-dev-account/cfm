import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the employee card to get the owner name
  const { data: card } = await supabase
    .from("employee_cards")
    .select("theme")
    .eq("public_slug", slug)
    .eq("is_active", true)
    .single();

  const theme = (card?.theme as any) || {};
  const cardOwnerName = theme?.name || "CFM Card";

  const manifest = {
    name: cardOwnerName,
    short_name: cardOwnerName,
    description: `Digital Business Card - ${cardOwnerName}`,
    start_url: `/card/${slug}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a", // green-600
    icons: [
      {
        src: "https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any maskable"
      },
      {
        src: "https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/thumb_for_the_home_screen.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any maskable"
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
