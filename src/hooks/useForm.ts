import type { Controller } from '../internal/createController.ts';
import { useInternalController } from './useInternalController.ts';
import type { ReadonlyRef } from './useRef.ts';

/** Use a reference (reactive state) bound to the associated form. */
export function useForm(): ReadonlyRef<HTMLFormElement | null> {
  return useInternalFormAssociatedController().refForm;
}

/** Use a reference (reactive state) bound to the form disabled state. */
export function useFormDisabled(): ReadonlyRef<boolean> {
  return useInternalFormAssociatedController().refDisabled;
}

/** Register a callback for form resets. */
export function useFormResetCallback(callback: () => void): void {
  useInternalFormAssociatedController().onReset.push(callback);
}

/** Register a callback for form restorations. */
export function useFormRestoreCallback(
  callback: (state: string | File | FormData, reason: 'restore' | 'autocomplete') => void,
): void {
  useInternalFormAssociatedController().onRestore.push(callback);
}

function useInternalFormAssociatedController(): Controller['formAssociated'] & {} {
  const { formAssociated } = useInternalController();
  if (!formAssociated) throw new Error('form hooks must be called in a form-associated component');
  return formAssociated;
}
