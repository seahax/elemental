import { getOrInsert } from '../internal/getOrInsert.ts';
import { useHost } from './useHost.ts';
import { useInternalController } from './useInternalController.ts';
import { type Ref, useRef } from './useRef.ts';

const hostRefMaps = new WeakMap<HTMLElement, Map<string, Ref<string | null>>>();

/** Use references (reactive state) bound to attributes. */
export function useAttributes<const TNames extends string[]>(
  ...names: TNames
): { -readonly [P in keyof TNames]: Ref<string | null> } {
  if (names.length === 0) return {} as any;
  const host = useHost();
  const refs: Ref<string | null>[] = [];
  const refMap = getOrInsert(hostRefMaps, host, (host) => {
    const { onAfterRender, onDisconnect } = useInternalController();
    const refMap = new Map<string, Ref<string | null>>();
    hostRefMaps.set(host, refMap);

    onAfterRender.push(() => {
      hostRefMaps.delete(host);

      const observer = new MutationObserver((mutation) => {
        for (const { attributeName } of mutation) {
          if (attributeName == null) continue;
          const ref = refMap.get(attributeName);
          if (ref) ref.value = host.getAttribute(attributeName);
        }
      });

      observer.observe(host, { attributeFilter: [...refMap.keys()], attributes: true });
      onDisconnect.push(() => observer.disconnect());
    });

    return refMap;
  });

  for (const name of names) {
    const ref = getOrInsert(refMap, name, (name) => {
      return useRef(host.getAttribute(name), (value) => {
        if (value == null) host.removeAttribute(name);
        else host.setAttribute(name, value);
      });
    });

    refs.push(ref);
  }

  return refs as any;
}
