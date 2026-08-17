import type { Metadata, Viewport } from "next";
import PwaRegistration from "@/components/player/PwaRegistration";

export const metadata: Metadata = {
  title: "Kopano Adaptive Player | Project Jennifer",
  description: "A governed mobile-first and PC-capable TypeScript Three.js player for Project Jennifer experiences.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kopano Player",
  },
  icons: {
    icon: [
      { url: "/icons/player-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/player-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/player-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#060912",
};

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaRegistration />
      {children}
    </>
  );
}
