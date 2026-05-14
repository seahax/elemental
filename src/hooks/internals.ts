import { useController } from './controller.ts';

/** Use the element internals. */
export function useElementInternals(): ElementInternals {
  return useController().attachInternals();
}
