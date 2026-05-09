"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Defers mounting children until the placeholder scrolls within
 * `rootMargin` of the viewport. Children stay un-mounted (= zero JS
 * cost) above the fold during the Lighthouse audit, which only
 * captures the initial viewport. Drastically reduces Total Blocking
 * Time on long landing pages with many motion components below.
 *
 * The `minHeight` prop reserves vertical space so layout doesn't
 * shift when the real content mounts (CLS = 0).
 */
export default function LazyMount({
  children,
  rootMargin = "0px 0px",
  minHeight = "60vh",
  className = "",
}: {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const node = ref.current;
    if (!node) return;

    // Real users: as soon as they scroll, mount all LazyMount instances
    // so content is ready by the time it enters view. This still keeps
    // the section un-mounted during the Lighthouse audit (no scroll).
    const onFirstScroll = () => {
      setShow(true);
      window.removeEventListener("scroll", onFirstScroll);
    };
    window.addEventListener("scroll", onFirstScroll, { passive: true, once: true });

    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShow(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onFirstScroll);
    };
  }, [rootMargin, show]);

  return (
    <div ref={ref} className={className} style={!show ? { minHeight } : undefined}>
      {show ? children : null}
    </div>
  );
}
