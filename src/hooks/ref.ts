import type { $$ref } from '../internal/controller.ts';
import { useController } from './controller.ts';

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

/** Use a reference (reactive state) value. */
export function useRef<T>(initialValue: T, onChange?: (value: T) => void): Ref<T> {
  return useController().createRef(initialValue, onChange);
}
