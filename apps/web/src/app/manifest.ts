import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kopano Adaptive Player — Project Jennifer",
    short_name: "Kopano Player",
    description: "A governed adaptive Three.js player for Project Jennifer experiences on mobile and PC.",
    start_url: "/player",
    scope: "/",
    display: "standalone",
    background_color: "#060912",
    theme_color: "#060912",
    orientation: "any",
    categories: ["games", "entertainment", "productivity"],
    icons: [
      {
        src: "/icons/player-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/player-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/player-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
