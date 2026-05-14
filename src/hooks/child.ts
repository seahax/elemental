import { useEffect } from './effect.ts';
import { useHost } from './host.ts';
import { useRef } from './ref.ts';

/** React to child list changes (non-recursive). */
export function useChildEffect(callback: () => (() => void) | void): void {
  const host = useHost();
  const ref = useRef(0);

  const observer = new MutationObserver((mutation) => {
    if (mutation.some((m) => m.type === 'childList')) {
      ref.value = (ref.value + 1) % Number.MAX_SAFE_INTEGER;
    }
  });

  useEffect([], () => {
    observer.observe(host, { childList: true });
    return () => observer.disconnect();
  });

  useEffect([ref], () => {
    return callback();
  });
}
