import { useEffect } from "react";

let lockCount = 0;
let originalOverflow = "";

export function useScrollLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    lockCount++;
    if (lockCount === 1) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = originalOverflow;
      }
    };
  }, [enabled]);
}
