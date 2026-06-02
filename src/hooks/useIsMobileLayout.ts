"use client";

import { useEffect, useState } from "react";

/** Davetiye editöründe sürükle-bırakı kapat (md altı). */
export function useIsMobileLayout(breakpointPx = 768): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpointPx]);

  return mobile;
}
