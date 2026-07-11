import type { Metadata } from "next";
import "./globals.css";
import "@/styles/cinematic.css";

export const metadata: Metadata = {
  title: "Relyo · Your AI shopping agent",
  description: "Search, verify and act inside your shopping mandate.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
