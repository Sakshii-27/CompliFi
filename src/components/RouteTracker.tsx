"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Tracks recent in-app routes for robust Back behavior.
 * - Stores the last path: 'complifi-last-path'
 * - Stores a capped history array: 'complifi-path-history'
 * Skips chatbot route and scanning/progress routes.
 */
export default function RouteTracker() {
  const pathname = usePathname();
  const lastStored = useRef<string | null>(null);

  // Heuristic blocklist for non-returnable routes (loading/scanning pages)
  const isBlocked = (p: string) => {
    if (!p) return true;
    if (p.startsWith("/chatbot")) return true;
    const pattern = /(scan|scanning|check|checking|analyz|processing|progress)/i;
    return pattern.test(p);
  };

  useEffect(() => {
    if (!pathname) return;
    try {
      if (lastStored.current === pathname) return;

      // Maintain last-path if not blocked
      if (!isBlocked(pathname)) {
        sessionStorage.setItem("complifi-last-path", pathname);
      }

      // Push into history if not blocked
      const raw = sessionStorage.getItem("complifi-path-history");
      const arr: string[] = raw ? JSON.parse(raw) : [];
      if (!isBlocked(pathname)) {
        // Avoid consecutive duplicates
        if (arr[arr.length - 1] !== pathname) arr.push(pathname);
        // Cap to last 10 items
        while (arr.length > 10) arr.shift();
        sessionStorage.setItem("complifi-path-history", JSON.stringify(arr));
      }

      lastStored.current = pathname;
    } catch {}
  }, [pathname]);

  return null;
}
