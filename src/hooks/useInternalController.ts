import { controllers } from '../internal/controllers.ts';
import { type Controller } from '../internal/createController.ts';

/** @internal Get the controller of the currently rendering component. */
export function useInternalController(): Controller {
  const controller = controllers.at(-1);
  if (!controller) throw new Error('hooks must be called by a render function');
  return controller;
}
