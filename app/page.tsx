import { redirect } from "next/navigation";

export default function HomePage() {
  // Middleware will automatically add locale prefix
  // /signin -> /en/signin (or user's preferred locale)
  redirect("/signin");
}

