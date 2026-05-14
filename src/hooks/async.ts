import { useEffect } from './effect.ts';
import { type ReadonlyRef, type Ref, type RefValues, useRef } from './ref.ts';

export interface AsyncValue<TValue> {
  readonly value: TValue | undefined;
  readonly error: unknown;
  readonly isLoading: boolean;
}

export interface AsyncOptions {
  readonly debounceMs?: number;
}

/** Use a reference (reactive state) bound to an async loader function. */
export function useAsync<const TDeps extends readonly ReadonlyRef<any>[], TValue>(
  deps: TDeps,
  callback: (signal: AbortSignal, ...values: RefValues<TDeps>) => Promise<TValue>,
  { debounceMs }: AsyncOptions = {},
): Ref<AsyncValue<TValue>> {
  const ref = useRef<AsyncValue<TValue>>({ value: undefined, error: undefined, isLoading: true });
  let skipDebounce = true;

  useEffect(deps, () => (...values) => {
    const ac = new AbortController();

    Promise.race(
      skipDebounce
        ? [Promise.resolve()]
        : [
            new Promise((resolve) => setTimeout(resolve, debounceMs)),
            new Promise((resolve) => ac.signal.addEventListener('abort', resolve, { once: true })),
          ],
    )
      .then(() => {
        if (ac.signal.aborted) return;
        return callback(ac.signal, ...(values as any));
      })
      .then((value) => {
        if (ac.signal.aborted) return;
        ref.value = { isLoading: false, value, error: undefined };
      })
      .catch((error: unknown) => {
        if (ac.signal.aborted) return;
        ref.value = { isLoading: false, value: undefined, error };
      });

    skipDebounce = false;
    return () => ac.abort();
  });

  // Skip the debounce again if the component unmounts.
  useEffect([], () => () => (skipDebounce = true));

  return ref;
}
