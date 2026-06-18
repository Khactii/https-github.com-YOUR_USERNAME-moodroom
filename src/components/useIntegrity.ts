import { useEffect, useRef, useState } from 'react';
import { VISIBILITY_GRACE_MS } from '../engine';

/**
 * WERC's "GPS": the phone is the verification instrument. While a session is
 * active we keep the screen awake (best-effort) and watch the Page Visibility
 * API. If the user leaves the app for longer than the grace window, the session
 * is marked unverified — honest, phone-free time only.
 */
export function useIntegrity(active: boolean) {
  const [verified, setVerified] = useState(true);
  const [leftAt, setLeftAt] = useState<number | null>(null);
  const hiddenSince = useRef<number | null>(null);
  const graceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    // Best-effort screen wake lock.
    let wakeLock: WakeLockSentinel | null = null;
    const requestWake = async () => {
      try {
        wakeLock = (await navigator.wakeLock?.request('screen')) ?? null;
      } catch {
        /* unsupported / denied — best effort only */
      }
    };
    requestWake();

    const onVisibility = () => {
      if (document.hidden) {
        hiddenSince.current = Date.now();
        graceTimer.current = window.setTimeout(() => {
          setVerified(false);
          setLeftAt(hiddenSince.current);
        }, VISIBILITY_GRACE_MS);
      } else {
        if (graceTimer.current) {
          clearTimeout(graceTimer.current);
          graceTimer.current = null;
        }
        hiddenSince.current = null;
        // re-acquire wake lock (released on hide)
        if (!wakeLock) requestWake();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (graceTimer.current) clearTimeout(graceTimer.current);
      wakeLock?.release().catch(() => {});
    };
  }, [active]);

  const reset = () => {
    setVerified(true);
    setLeftAt(null);
    hiddenSince.current = null;
  };

  return { verified, leftAt, reset };
}
