export interface Callbacks<TArgs extends unknown[] = []> {
  readonly push: (callback: (...args: TArgs) => void) => () => void;
  readonly run: (...args: TArgs) => void;
  readonly runAndClear: (...args: TArgs) => void;
  readonly clear: () => void;
}

export function createCallbacks<TArgs extends unknown[] = []>(): Callbacks<TArgs> {
  const callbacks = new Set<(...args: TArgs) => void>();

  const self: Callbacks<TArgs> = {
    push: (callback) => {
      callbacks.add(callback);
      return () => callbacks.delete(callback);
    },
    run: (...args) => {
      const errors: unknown[] = [];
      const callbacksCopy = [...callbacks];

      for (const callback of callbacksCopy) {
        try {
          callback(...args);
        } catch (error: unknown) {
          errors.push(error);
        }
      }

      if (errors.length > 0) throw new AggregateError(errors);
    },
    runAndClear: (...args: TArgs) => {
      try {
        self.run(...args);
      } finally {
        self.clear();
      }
    },
    clear: () => {
      callbacks.clear();
    },
  };

  return self;
}
