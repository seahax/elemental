import type { Controller } from '../internal/controller.ts';
import { useController } from './controller.ts';
import type { ReadonlyRef } from './ref.ts';

/** Use a reference (reactive state) bound to the associated form. */
export function useForm(): ReadonlyRef<HTMLFormElement | null> {
  return useFormAssociated().refForm;
}

/** Use a reference (reactive state) bound to the form disabled state. */
export function useFormDisabled(): ReadonlyRef<boolean> {
  return useFormAssociated().refDisabled;
}

/** Register a callback for form resets. */
export function useFormResetCallback(callback: () => void): void {
  useFormAssociated().onReset.push(callback);
}

/** Register a callback for form restorations. */
export function useFormRestoreCallback(
  callback: (state: string | File | FormData, reason: 'restore' | 'autocomplete') => void,
): void {
  useFormAssociated().onRestore.push(callback);
}

function useFormAssociated(): Controller['formAssociated'] & {} {
  const { formAssociated } = useController();
  if (!formAssociated) throw new Error('form hooks must be called in a form-associated component');
  return formAssociated;
}
