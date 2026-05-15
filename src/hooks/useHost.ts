import { useInternalController } from './useInternalController.ts';

/** Use the component host element. */
export function useHost(): HTMLElement {
  return useInternalController().host;
}
