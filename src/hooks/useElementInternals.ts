import { useInternalController } from './useInternalController.ts';

/** Use the element internals. */
export function useElementInternals(): ElementInternals {
  return useInternalController().attachInternals();
}
