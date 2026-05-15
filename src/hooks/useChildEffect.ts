import { getOrInsert } from '../internal/getOrInsert.ts';
import { useEffect } from './useEffect.ts';
import { useHost } from './useHost.ts';
import { useInternalController } from './useInternalController.ts';
import { type Ref, useRef } from './useRef.ts';

const hostRefs = new WeakMap<HTMLElement, Ref<{}>>();

/** React to child list changes (non-recursive). */
export function useChildEffect(callback: () => (() => void) | void): void {
  const host = useHost();
  const ref = getOrInsert(hostRefs, host, () => {
    const { onAfterRender, onDisconnect } = useInternalController();
    const ref = useRef({});

    onAfterRender.push(() => {
      hostRefs.delete(host);

      const observer = new MutationObserver(() => {
        ref.value = {};
      });

      observer.observe(host, { childList: true });
      onDisconnect.push(() => observer.disconnect());
    });

    return ref;
  });

  useEffect([ref], () => callback());
}
