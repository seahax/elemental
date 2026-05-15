import { useEffect } from './useEffect.ts';
import { useHost } from './useHost.ts';
import { type Ref, useRef } from './useRef.ts';

/** Use references (reactive state) bound to attributes. */
export function useAttributes<const TNames extends string[]>(
  ...names: TNames
): { -readonly [P in keyof TNames]: Ref<string | null> } {
  if (names.length === 0) return {} as any;
  const host = useHost();
  const refs: Ref<string | null>[] = [];
  const refMap = new Map<string, Ref<string | null>>();

  for (const name of names) {
    const ref = useRef(host.getAttribute(name), (value) => {
      if (value == null) host.removeAttribute(name);
      else host.setAttribute(name, value);
    });

    refs.push(ref);
    refMap.set(name, ref);
  }

  const observer = new MutationObserver((mutation) => {
    for (const { attributeName } of mutation) {
      if (attributeName != null && Object.hasOwn(refs, attributeName)) {
        refMap.get(attributeName)!.value = host.getAttribute(attributeName);
      }
    }
  });

  useEffect([], () => {
    observer.observe(host, { attributeFilter: names, attributes: true });
    return () => observer.disconnect();
  });

  return refs as any;
}
