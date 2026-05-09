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
  rootMargin = "300px 0px",
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
    return () => io.disconnect();
  }, [rootMargin, show]);

  return (
    <div ref={ref} className={className} style={!show ? { minHeight } : undefined}>
      {show ? children : null}
    </div>
  );
}
