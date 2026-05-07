import { type Context, contextStack } from '../internal/context.ts';

/** @internal Get the context of the currently rendering component. */
export function useContext(): Context {
  const context = contextStack.at(-1);
  if (!context) throw new Error('hooks must be called inside a render function');
  return context;
}
