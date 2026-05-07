import { useContext } from './context.ts';

/** Get the component host element. */
export function useHost(): HTMLElement {
  return useContext().host;
}
