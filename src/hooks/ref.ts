import { useContext } from './context.ts';

export interface Ref<T> extends ReadonlyRef<T> {
  value: T;
}

export interface ReadonlyRef<T> {
  /** @hidden */
  [$$ref]: unknown;
  readonly value: T;
}

export type RefValues<T> = T extends readonly any[]
  ? { [K in keyof T]: T[K] extends ReadonlyRef<infer V> ? V : never }
  : never;

const $$ref = Symbol();

/** Use a reference (reactive state) value. */
export function useRef<T>(initialValue: T, onChange?: (value: T) => void): Ref<T> {
  const { notify } = useContext();
  let value = initialValue;

  return {
    [$$ref]: true,
    get value() {
      return value;
    },
    set value(newValue) {
      if (newValue === value) return;
      value = newValue;
      onChange?.(value);
      notify();
    },
  };
}
