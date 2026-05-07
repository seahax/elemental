import { type Ref, useRef } from './hooks/ref.ts';
import { createContextController } from './internal/context.ts';

type SafeProps<TProps> = any extends any
  ? { [P in keyof TProps as P extends keyof HTMLElement ? never : P]: TProps[P] }
  : never;

export interface ComponentConstructor<TProps extends object> {
  new (): ComponentWithProps<TProps>;
}

export interface ComponentOptions<TProps extends object> {
  readonly shadow?: Partial<ShadowRootInit>;
  readonly props?: ComponentPropDescriptors<TProps>;
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
  { props, shadow }: ComponentOptions<Record<string, unknown>> = {},
): ComponentConstructor<{}> {
  return class extends HTMLElement {
    readonly #propRefs: ComponentPropRefs<Record<string, unknown>> = {};
    readonly #contextController = createContextController(this);

    constructor() {
      super();

      if (props) {
        const propRefs: Record<string, Ref<unknown>> = this.#propRefs;

        for (const [key, getDescriptor] of Object.entries(props)) {
          if (key in this) continue;
          const ref = (propRefs[key] = useRef<any>(undefined));
          const descriptor = getDescriptor(ref, this);
          Object.defineProperty(this, key, descriptor);
        }
      }
    }

    protected connectedCallback(): void {
      this.#contextController.connect(() => {
        const shadowRoot = this.attachShadow({ ...shadow, mode: shadow?.mode ?? 'open' });
        render(shadowRoot as ComponentShadowRoot<Record<string, unknown>>, this.#propRefs);
      });
    }

    protected disconnectedCallback(): void {
      this.#contextController.disconnect();
    }
  };
}
