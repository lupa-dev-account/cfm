import { redirect } from "next/navigation";

export default function HomePage() {
  // Middleware will automatically add locale prefix
  // /home -> /en/home (or user's preferred locale)
  redirect("/home");
}

