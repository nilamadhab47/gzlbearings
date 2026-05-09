"use client";

/**
 * Defers all non-essential, decorative client UI (cursor effects, FABs)
 * until the browser is idle AFTER the main page is interactive.
 * The welcome modal is split out further — it only mounts after the
 * user actually scrolls (engagement signal + zero impact on Lighthouse).
 *
 * Each piece is dynamically imported with ssr:false so it's split into
 * its own chunk and never blocks the initial JS payload.
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MouseSpotlight = dynamic(() => import("./MouseSpotlight"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const WhatsAppFab = dynamic(() => import("./WhatsAppFab"), { ssr: false });
const WelcomeModal = dynamic(() => import("./WelcomeModal"), { ssr: false });

export default function DeferredChrome() {
  const [ready, setReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

    // Modal only loads after the user has shown engagement (scroll).
    const onScroll = () => {
      if (window.scrollY > 200) {
        setScrolled(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <MouseSpotlight />
      <CustomCursor />
      <WhatsAppFab />
      {scrolled ? <WelcomeModal /> : null}
    </>
  );
}

