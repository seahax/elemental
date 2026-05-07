import { type ReadonlyRef, type Ref, type RefValues } from '../component.ts';
import { createCallbacks } from '../internal/callbacks.ts';
import { $$renderContextStack } from '../internal/constants.ts';

/** Get the component host element. */
export function useHost(): HTMLElement {
  return getHookContext().host;
}

/** Create an observable value. */
export function useRef<T>(initialValue: T, onChange?: (value: T) => void): Ref<T> {
  return getHookContext().useRef(initialValue, onChange);
}

/** React to observable (reference) changes. */
export function useEffect<const TDeps extends readonly ReadonlyRef<any>[]>(
  deps: TDeps,
  callback: (...values: RefValues<TDeps>) => (() => void) | void,
): void {
  const { onSetRef, onDisconnect } = getHookContext();
  const cleanupCallback = createCallbacks();
  const cleanup = (): void => cleanupCallback.run({ clear: true });
  let values: any[] | undefined;

  onSetRef.push((): void => {
    const newValues = deps.map((dep) => dep.value);
    if (values?.length === newValues.length && values?.every((value, i) => value === newValues[i])) return;
    values = newValues;
    cleanup();
    const maybeCleanup = callback(...(values as any));
    if (maybeCleanup) cleanupCallback.push(() => maybeCleanup());
  });

  onDisconnect.push(cleanup);
}

function getHookContext(): (typeof window)[typeof $$renderContextStack][0] {
  const context = window[$$renderContextStack].at(-1);
  if (!context) throw new Error('hooks must be called inside a render function');
  return context;
}
