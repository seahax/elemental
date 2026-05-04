import type { Ref } from '../component.ts';
import { getRouter } from '../router.ts';
import { useEffect, useRef } from './core.ts';
import { useStore } from './store.ts';

export interface RouteOptions {
  readonly match?: 'prefix' | 'exact' | RegExp;
  readonly source?: 'pathname' | 'hash';
}

export type RouteMatchArray = readonly [string, ...string[]] & { readonly groups: Record<string, string> };

/** Observe route (window.history) changes. */
export function useRoute(
  path: string | readonly string[],
  { match = 'prefix', source = 'pathname' }: RouteOptions = {},
): Ref<RouteMatchArray | null> {
  const matchRx = match === 'exact' ? /^$/u : match === 'prefix' ? /^.*$/u : match;
  const paths = Array.isArray(path) ? (path as readonly string[]) : [path as string];
  const refRoute = useStore(getRouter(), (state) => state[source]);
  const refMatch = useRef<RouteMatchArray | null>(getMatch(refRoute.value));

  useEffect([refRoute], (route) => {
    refMatch.value = getMatch(route);
  });

  return refMatch;

  function getMatch(route: string): RouteMatchArray | null {
    const prefix = paths.find((path) => route.endsWith(path)) ?? null;
    if (prefix == null) return null;
    route = route.slice(prefix.length);
    return route.match(matchRx) as RouteMatchArray | null;
  }
}
