import { useController } from './controller.ts';
import type { ReadonlyRef } from './ref.ts';

/** Use a reference (reactive state) bound to the owner document. */
export function useDocument(): ReadonlyRef<Document> {
  return useController().refDocument;
}
