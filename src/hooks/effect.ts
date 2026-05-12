import { createCallbacks } from '../internal/callbacks.ts';
import { useContext } from './context.ts';
import type { ReadonlyRef, RefValues } from './ref.ts';

/** React to observable (reference) changes. */
export function useEffect<const TDeps extends readonly ReadonlyRef<any>[]>(
  deps: TDeps,
  callback: (...values: RefValues<TDeps>) => (() => void) | void,
): void {
  const { onNotify, onDisconnect } = useContext();
  const cleanupCallback = createCallbacks();
  const cleanup = (): void => cleanupCallback.runAndClear();
  let values: any[] | undefined;

  onNotify.push((): void => {
    const newValues = deps.map((dep) => dep.value);
    if (values?.length === newValues.length && values?.every((value, i) => value === newValues[i])) return;
    values = newValues;
    cleanup();
    const maybeCleanup = callback(...(values as any));
    if (maybeCleanup) cleanupCallback.push(() => maybeCleanup());
  });

  onDisconnect.push(cleanup);
}

/**
 * React to document disconnection.
 *
 * Alias for: `useEffect([], () => callback)`
 */
export function useDisconnectEffect(callback: () => void): void {
  useEffect([], () => callback);
}
