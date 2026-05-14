import { useController } from './controller.ts';
import type { ReadonlyRef } from './ref.ts';

/** Use a reference (reactive state) bound to the parent node. */
export function useParent(): ReadonlyRef<ParentNode | null> {
  return useController().refParent;
}
