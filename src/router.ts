import { createStore, type Store } from './store.ts';

export interface RouterState {
  readonly pathname: string;
  readonly hash: string;
}

/**
 * Get a router {@link Store} that is updated when the client side route (aka:
 * `History`) changes. This method returns the same store every time it is
 * called (ie. a singleton).
 */
export function getRouter(): Store<RouterState> {
  return (singleton ??= createRouter());
}

let singleton: Store<RouterState> | undefined;

function createRouter(): Store<RouterState> {
  const store = createStore<RouterState>({
    pathname: window.location.pathname,
    hash: window.location.hash,
  });

  const onUpdate = (): void => {
    let state = store.state;

    if (store.state.pathname !== window.location.pathname) {
      state = { ...state, pathname: window.location.pathname };
    }

    if (store.state.hash !== window.location.hash) {
      state = { ...state, hash: window.location.hash };
    }

    store.state = state;
  };

  Object.defineProperties(
    history,
    Object.fromEntries(
      (['pushState', 'replaceState'] as const).map((method: 'pushState' | 'replaceState') => {
        const original = history[method].bind(history) as History['pushState'] & History['replaceState'];
        const descriptor: PropertyDescriptor = {
          value: (...args: Parameters<typeof original>) => {
            original(...args);
            onUpdate();
          },
          enumerable: true,
          configurable: true,
        };

        return [method, descriptor];
      }),
    ),
  );

  window.addEventListener('popstate', onUpdate);

  return store;
}
