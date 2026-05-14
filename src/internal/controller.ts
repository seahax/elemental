import { type ReadonlyRef, type Ref } from '../hooks/ref.ts';
import { type Callbacks, createCallbacks } from './callbacks.ts';

export interface Controller {
  readonly host: HTMLElement;
  readonly onNotify: Callbacks;
  readonly onDisconnect: Callbacks;
  readonly refDocument: ReadonlyRef<Document>;
  readonly refParent: ReadonlyRef<ParentNode | null>;
  readonly formAssociated:
    | {
        readonly refForm: ReadonlyRef<HTMLFormElement | null>;
        readonly refDisabled: ReadonlyRef<boolean>;
        readonly onReset: Callbacks;
        readonly onRestore: Callbacks<[state: string | File | FormData, reason: 'restore' | 'autocomplete']>;
      }
    | undefined;
  readonly createRef: <T>(value: T, onChange?: (value: T) => void) => Ref<T>;
  readonly attachInternals: () => ElementInternals;
  readonly connectedCallback: () => void;
  readonly connectedMoveCallback: () => void;
  readonly disconnectedCallback: () => void;
  readonly adoptedCallback: () => void;
  readonly formDisabledCallback: (disabled: boolean) => void;
  readonly formResetCallback: () => void;
  readonly formStateRestoreCallback: (state: string | File | FormData, reason: 'restore' | 'autocomplete') => void;
}

export interface ControllerConfig {
  readonly host: HTMLElement;
  readonly formAssociated: boolean;
  readonly render: (controller: Controller) => void;
  readonly attachInternals: () => ElementInternals;
}

export const $$ref = Symbol();

const controllers: Controller[] = [];

export function getController(): Controller | undefined {
  return controllers.at(-1);
}

export function createController({ host, formAssociated, render, attachInternals }: ControllerConfig): Controller {
  let notifying = false;
  let connected = false;
  let internals: ElementInternals | undefined;

  let deferredFormUpdate:
    | { readonly type: 'reset' }
    | { readonly type: 'restore'; state: string | File | FormData; reason: 'restore' | 'autocomplete' }
    | undefined;

  const onNotify = createCallbacks();

  const createRef = <T>(initialValue: T, onChange?: (value: T) => void): Ref<T> => {
    let value = initialValue;

    return {
      [$$ref]: true,
      get value() {
        return value;
      },
      set value(newValue) {
        if (newValue === value) return;
        value = newValue;
        onChange?.(value);
        if (!connected || notifying) return;
        notifying = true;

        queueMicrotask(() => {
          notifying = false;
          onNotify.run();
        });
      },
    };
  };

  const controller = {
    host,
    onNotify,
    onDisconnect: createCallbacks(),
    refDocument: createRef(host.ownerDocument),
    refParent: createRef(host.parentNode),
    formAssociated: formAssociated
      ? {
          refForm: createRef<HTMLFormElement | null>(null),
          refDisabled: createRef(false),
          onReset: createCallbacks(),
          onRestore: createCallbacks(),
        }
      : undefined,
    createRef,
    attachInternals: () => {
      return (internals ??= attachInternals());
    },
    connectedCallback: () => {
      connected = true;
      controller.refParent.value = host.parentNode;

      try {
        controllers.push(controller);
        render(controller);
      } finally {
        controllers.pop();
      }

      if (deferredFormUpdate?.type === 'reset') {
        controller.formAssociated?.onReset.run();
      } else if (deferredFormUpdate?.type === 'restore') {
        controller.formAssociated?.onRestore.run(deferredFormUpdate.state, deferredFormUpdate.reason);
      }

      controller.onNotify.run();
    },
    connectedMoveCallback: () => {
      controller.refParent.value = host.parentNode;
      controller.onNotify.run();
    },
    disconnectedCallback: () => {
      controller.onNotify.clear();
      controller.formAssociated?.onReset.clear();
      controller.formAssociated?.onRestore.clear();
      controller.onDisconnect.runAndClear();
    },
    adoptedCallback: () => {
      controller.refDocument.value = host.ownerDocument;
      controller.onNotify.run();
    },
    formDisabledCallback: (disabled: boolean) => {
      if (!controller.formAssociated) return;
      controller.formAssociated.refDisabled.value = disabled;
      controller.onNotify.run();
    },
    formResetCallback: () => {
      if (!controller.formAssociated) return;
      if (connected) controller.formAssociated.onReset.run();
      else deferredFormUpdate = { type: 'reset' };
    },
    formStateRestoreCallback: (state, reason) => {
      if (!controller.formAssociated) return;
      if (connected) controller.formAssociated.onRestore.run(state, reason);
      else deferredFormUpdate = { type: 'restore', state, reason };
    },
  } satisfies Controller;

  return controller;
}
