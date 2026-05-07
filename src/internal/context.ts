import { type Callbacks, createCallbacks } from './callbacks.ts';

export interface Context {
  readonly host: HTMLElement;
  readonly onNotify: Callbacks;
  readonly onDisconnect: Callbacks;
  readonly notify: () => void;
}

export interface ContextController {
  readonly connect: (callback: () => void) => void;
  readonly disconnect: () => void;
}

export const contextStack: Context[] = [];

export function createContextController(host: HTMLElement): ContextController {
  let notifying = false;

  const context: Context = {
    host,
    onNotify: createCallbacks(),
    onDisconnect: createCallbacks(),
    notify: () => {
      if (notifying) return;
      notifying = true;

      queueMicrotask(() => {
        notifying = false;
        context.onNotify.run();
      });
    },
  };

  return {
    connect: (callback) => {
      try {
        contextStack.push(context);
        callback();
      } finally {
        contextStack.pop();
      }

      context.onNotify.run();
    },
    disconnect: () => {
      context.onNotify.clear();
      context.onDisconnect.runAndClear();
    },
  };
}
