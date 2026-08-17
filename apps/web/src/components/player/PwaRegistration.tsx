"use client";

import { useEffect } from "react";

export default function PwaRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let active = true;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error: unknown) => {
      if (active) console.warn("[KAP] service worker registration failed", error);
    });
    return () => {
      active = false;
    };
  }, []);
  return null;
}
