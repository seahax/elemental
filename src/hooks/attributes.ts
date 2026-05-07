import type { Ref } from '../component.ts';
import { useEffect, useHost, useRef } from './core.ts';

/** Observe attribute changes. */
export function useAttributes<TName extends string>(...names: TName[]): Readonly<Record<TName, Ref<string | null>>> {
  if (names.length === 0) return {} as any;
  const host = useHost();

  const refs = Object.fromEntries(
    names.map((name) => [
      name,
      useRef(host.getAttribute(name), (value) => {
        if (value == null) host.removeAttribute(name);
        else host.setAttribute(name, value);
      }),
    ]),
  );

  const observer = new MutationObserver((mutation) => {
    for (const { attributeName } of mutation) {
      if (attributeName != null && Object.hasOwn(refs, attributeName)) {
        refs[attributeName]!.value = host.getAttribute(attributeName);
      }
    }
  });

  useEffect([], () => {
    observer.observe(host, { attributeFilter: names, attributes: true });
    return () => observer.disconnect();
  });

  return refs as Readonly<Record<TName, Ref<string | null>>>;
}
