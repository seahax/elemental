import { type Controller, getController } from '../internal/controller.ts';

/** @internal Get the controller of the currently rendering component. */
export function useController(): Controller {
  const controller = getController();
  if (!controller) throw new Error('hooks must be called by a render function');
  return controller;
}
