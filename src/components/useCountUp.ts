import { useEffect, useRef, useState } from 'react';

/** Animate a number from `from` to `to` over `duration` ms (ease-out). */
export function useCountUp(to: number, duration = 1200, from = 0, start = true): number {
  const [value, setValue] = useState(from);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [to, duration, from, start]);

  return value;
}
