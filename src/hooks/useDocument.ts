import { useInternalController } from './useInternalController.ts';
import type { ReadonlyRef } from './useRef.ts';

/** Use a reference (reactive state) bound to the owner document. */
export function useDocument(): ReadonlyRef<Document> {
  return useInternalController().refDocument;
}
