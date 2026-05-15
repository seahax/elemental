import type { Store } from '../createStore.ts';
import { useEffect } from './useEffect.ts';
import { type ReadonlyRef, type Ref, useRef } from './useRef.ts';

/** Use a reference (reactive state) bound to a (shared) store. */
export function useStore<TState, TValue = TState>(
  store: Store<TState>,
  select: (state: TState) => TValue,
  mutate: (store: Store<TState>, value: TValue) => void,
): Ref<TValue>;
export function useStore<TState, TValue = TState>(
  store: Store<TState>,
  select?: (state: TState) => TValue,
): ReadonlyRef<TValue>;
export function useStore<TState, TValue = TState>(
  store: Store<TState>,
  select: (state: TState) => TValue = (state) => state as unknown as TValue,
  mutate?: (store: Store<TState>, value: TValue) => void,
): Ref<TValue> {
  const ref = useRef(select(store.state), mutate && ((value) => mutate(store, value)));
  useEffect([], () => store.subscribe((state) => (ref.value = select(state))));
  return ref;
}
