import { useInternalController } from './useInternalController.ts';
import type { ReadonlyRef } from './useRef.ts';

/** Use a reference (reactive state) bound to the parent node. */
export function useParent(): ReadonlyRef<ParentNode | null> {
  return useInternalController().refParent;
}
