import { type Ref } from './hooks/ref.ts';
import { type Controller, createController } from './internal/controller.ts';

type SafeProps<TProps> = any extends any
  ? { [P in keyof TProps as P extends keyof HTMLElement ? never : P]: TProps[P] }
  : never;

export interface ComponentConstructor<TProps extends object> {
  readonly formAssociated: boolean;
  new (): ComponentWithProps<TProps>;
}

export interface ComponentOptions<TProps extends object> {
  /** Shadow root attachment options. */
  readonly shadow?: Partial<ShadowRootInit>;
  /** Component custom property descriptors. */
  readonly props?: ComponentPropDescriptors<TProps>;
  /** True to mark the component as form-associated. */
  readonly formAssociated?: boolean;
}

export type ComponentPropDescriptors<TProps extends object> = {
  readonly [P in keyof SafeProps<TProps>]: ComponentPropDescriptorFactory<TProps[P]>;
};

export type ComponentPropDescriptorFactory<TType> = (
  ref: Ref<TType | undefined>,
  host: HTMLElement,
) => ComponentPropDescriptor<TType>;

export interface ComponentPropDescriptor<T> extends Omit<PropertyDescriptor, 'value' | 'get' | 'set'> {
  get(): T;
  set?(value: T): void;
}

export type ComponentWithProps<TProps extends object> = HTMLElement & {
  -readonly [P in keyof SafeProps<TProps>]: TProps[P];
};

export type ComponentShadowRoot<TProps extends object> = Omit<ShadowRoot, 'host'> & {
  readonly host: ComponentWithProps<TProps>;
};

export type ComponentPropRefs<TProps extends object> = {
  readonly [P in keyof SafeProps<TProps>]: Ref<TProps[P] | undefined>;
};

/** Define a custom `HTMLElement` that is functional and reactive. */
export function defineComponent<TProps extends object = {}>(
  render: (shadowRoot: ComponentShadowRoot<TProps>, props: ComponentPropRefs<TProps>) => void,
  options?: ComponentOptions<TProps>,
): ComponentConstructor<TProps>;
export function defineComponent(
  render: (
    shadowRoot: ComponentShadowRoot<Record<string, unknown>>,
    props: ComponentPropRefs<Record<string, unknown>>,
  ) => void,
  { props, shadow, formAssociated = false }: ComponentOptions<Record<string, unknown>> = {},
): ComponentConstructor<{}> {
  return class extends HTMLElement {
    static readonly formAssociated = formAssociated;

    readonly #shadow: ComponentShadowRoot<Record<string, unknown>>;
    readonly #controller: Controller;
    readonly #props: ComponentPropRefs<Record<string, unknown>> = {};

    constructor() {
      super();

      this.#shadow = this.attachShadow({
        ...shadow,
        mode: shadow?.mode ?? 'open',
      }) as ComponentShadowRoot<Record<string, unknown>>;

      this.#controller = createController({
        host: this,
        formAssociated,
        render: () => render(this.#shadow, this.#props),
        attachInternals: () => super.attachInternals(),
      });

      if (props) {
        const propRefs: Record<string, Ref<unknown>> = this.#props;

        for (const [key, getDescriptor] of Object.entries(props)) {
          if (key in this) continue;
          const ref = (propRefs[key] = this.#controller.createRef<any>(undefined));
          const descriptor = getDescriptor(ref, this);
          Object.defineProperty(this, key, descriptor);
        }
      }

      if (formAssociated) {
        this.attachInternals();
      }
    }

    override attachInternals(): ElementInternals {
      return this.#controller.attachInternals();
    }

    protected connectedCallback(): void {
      this.#controller.connectedCallback();
    }

    protected connectedMoveCallback(): void {
      this.#controller.connectedMoveCallback();
    }

    protected disconnectedCallback(): void {
      this.#controller.disconnectedCallback();
    }

    protected adoptedCallback(): void {
      this.#controller.adoptedCallback();
    }

    protected formDisabledCallback(disabled: boolean): void {
      this.#controller.formDisabledCallback(disabled);
    }

    protected formResetCallback(): void {
      this.#controller.formResetCallback();
    }

    protected formStateRestoreCallback(state: string | File | FormData, reason: 'restore' | 'autocomplete'): void {
      this.#controller.formStateRestoreCallback(state, reason);
    }
  };
}
