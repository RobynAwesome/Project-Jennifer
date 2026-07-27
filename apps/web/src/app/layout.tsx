import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Jennifer",
  description:
    "Sovereign Governance Intelligence Runtime – a persistent, living governance ecosystem",
  keywords: [
    "governance",
    "AI",
    "runtime",
    "telemetry",
    "memory",
    "NPC",
    "Jennifer",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-jennifer-dark text-white antialiased font-mono min-h-screen">
        {children}
      </body>
    </html>
  );
}
