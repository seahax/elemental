import { useController } from './controller.ts';

/** Use the component host element. */
export function useHost(): HTMLElement {
  return useController().host;
}
