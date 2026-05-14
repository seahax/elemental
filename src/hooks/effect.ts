import { useController } from './controller.ts';
import { useDisconnectCallback } from './disconnect.ts';
import type { ReadonlyRef, RefValues } from './ref.ts';

/** React to observable (reference) changes. */
export function useEffect<const TDeps extends readonly ReadonlyRef<any>[]>(
  deps: TDeps,
  callback: (...values: RefValues<TDeps>) => (() => void) | void,
): void {
  let cleanupCallback: (() => void) | void;
  let values: any[] | undefined;

  const cleanup = () => {
    const callback = cleanupCallback;
    cleanupCallback = undefined;
    callback?.();
  };

  useController().onNotify.push((): void => {
    const newValues = deps.map((dep) => dep.value);
    if (values?.length === newValues.length && values?.every((value, i) => value === newValues[i])) return;
    values = newValues;
    cleanup();
    cleanupCallback = callback(...(values as any));
  });

  useDisconnectCallback(cleanup);
}
