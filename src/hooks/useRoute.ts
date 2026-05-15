import { getRouter } from '../getRouter.ts';
import { useEffect } from './useEffect.ts';
import { type Ref, useRef } from './useRef.ts';
import { useStore } from './useStore.ts';

export interface RouteOptions {
  readonly match?: 'prefix' | 'exact' | RegExp;
  readonly source?: 'pathname' | 'hash';
}

export type RouteMatch = readonly [string, ...string[]] & { readonly groups: Record<string, string> };

/** Use a reference (reactive state) bound to route matching. */
export function useRoute(
  path: string | readonly string[],
  { match = 'prefix', source = 'pathname' }: RouteOptions = {},
): Ref<RouteMatch | null> {
  const matchRx = match === 'exact' ? /^$/u : match === 'prefix' ? /^.*$/u : match;
  const paths = Array.isArray(path) ? (path as readonly string[]) : [path as string];
  const refRoute = useStore(getRouter(), (state) => state[source]);
  const refMatch = useRef<RouteMatch | null>(getMatch(refRoute.value));

  useEffect([refRoute], (route) => {
    refMatch.value = getMatch(route);
  });

  return refMatch;

  function getMatch(route: string): RouteMatch | null {
    const prefix = paths.find((path) => route.endsWith(path)) ?? null;
    if (prefix == null) return null;
    route = route.slice(prefix.length);
    return route.match(matchRx) as RouteMatch | null;
  }
}
