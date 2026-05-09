"use client";

/**
 * Defers all non-essential, decorative client UI (cursor effects, FABs,
 * welcome modal) until the browser is idle AFTER the main page is
 * interactive. This drastically reduces Total Blocking Time on the
 * Lighthouse / PageSpeed audit, since those scripts no longer compete
 * for main-thread time during/just after FCP+LCP.
 *
 * Each piece is dynamically imported with ssr:false so it's split into
 * its own chunk and never blocks the initial JS payload.
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Each is a separate chunk, only fetched once `ready` flips to true.
const MouseSpotlight = dynamic(() => import("./MouseSpotlight"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const WhatsAppFab = dynamic(() => import("./WhatsAppFab"), { ssr: false });
const WelcomeModal = dynamic(() => import("./WelcomeModal"), { ssr: false });

export default function DeferredChrome() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };

    let cancelled = false;
    const trigger = () => {
      if (!cancelled) setReady(true);
    };

    // Wait for `load` first (so all critical resources are done),
    // then for the browser to be idle. Falls back to setTimeout.
    const onLoad = () => {
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(trigger, { timeout: 3000 });
      } else {
        window.setTimeout(trigger, 1500);
      }
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <MouseSpotlight />
      <CustomCursor />
      <WhatsAppFab />
      <WelcomeModal />
    </>
  );
}
