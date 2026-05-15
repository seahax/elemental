// prettier-ignore
type Alpha = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
type ChildValue = Node | HtmlDeferredElement | string | number | bigint | false | null | undefined;
type AttrValue = string | number | bigint | boolean | null | undefined;
type TagMap = HTMLElementTagNameMap & HTMLElementDeprecatedTagNameMap;

type IfEquals<T, U, Y = unknown, N = never> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2 ? Y : N;

type ElementType<TElement> = TElement extends string
  ? TElement extends keyof TagMap
    ? TagMap[TElement]
    : HTMLElement
  : TElement extends CustomElementConstructor
    ? InstanceType<TElement>
    : TElement extends Element | Document | ShadowRoot
      ? TElement
      : never;

type ElementProps<TElement> = {
  readonly [P in keyof TElement & string as TElement[P] extends ((...args: any[]) => any) | null | undefined
    ? never
    : IfEquals<Record<P, TElement[P]>, Pick<TElement, P>, `:${P}`, never>]?: TElement[P];
};

type ElementAttrs<TElement> = TElement extends string | CustomElementConstructor | Element
  ? Readonly<Record<`${Alpha}${string}`, AttrValue>>
  : {};

export type HtmlConfig<TElement> = ElementAttrs<TElement> & ElementProps<ElementType<TElement>>;
export type HtmlConfigWithKey<TElement> = { readonly [DATA_KEY]: string } & HtmlConfig<TElement>;

export interface HtmlDeferredElement<TElement extends HTMLElement = HTMLElement> {
  readonly tag: string;
  readonly config: { readonly [DATA_KEY]: string } & HtmlConfig<TElement>;
  readonly children: readonly ChildValue[] | undefined;
  toElement: () => TElement;
}

const DATA_KEY = 'data-key';

/**
 * Create a deferred HTML element with a key.
 *
 * Final element creation is deferred until the element is used as a child,
 * when it can be determined if a new element should be created, or an existing
 * element with the same key and tag-name should be updated.
 */
export function html<const TElement extends keyof TagMap | (string & {}) | CustomElementConstructor>(
  el: TElement,
  config: HtmlConfigWithKey<TElement>,
  children?: readonly ChildValue[],
): HtmlDeferredElement<ElementType<TElement>>;

/**
 * Create or update an HTML element.
 */
export function html<
  TElement extends keyof TagMap | (string & {}) | CustomElementConstructor | Element | Document | ShadowRoot,
>(el: TElement, attrs?: HtmlConfig<TElement>, children?: readonly ChildValue[]): ElementType<NoInfer<TElement>>;
export function html<
  TElement extends keyof TagMap | (string & {}) | CustomElementConstructor | Element | Document | ShadowRoot,
>(el: TElement, children?: readonly ChildValue[]): ElementType<TElement>;

export function html(
  el: string | CustomElementConstructor | Element | Document | ShadowRoot,
  attrsOrChildren: readonly ChildValue[] | Readonly<Record<string, any>> = {},
  children: readonly ChildValue[] = [],
): Node | HtmlDeferredElement {
  if (typeof el === 'function') {
    let name = customElements.getName(el);

    if (name == null) {
      name = `ce-${crypto.randomUUID()}`;
      customElements.define(name, el);
    }

    el = name;
  }

  let attrs: Readonly<Record<string, any>>;
  [attrs, children] = Array.isArray(attrsOrChildren)
    ? [{}, attrsOrChildren as readonly ChildValue[]]
    : [attrsOrChildren as Readonly<Record<string, any>>, children];

  if (typeof el === 'string') {
    return DATA_KEY in attrs
      ? {
          tag: el,
          config: attrs as HtmlDeferredElement['config'],
          children,
          toElement: () => html(document.createElement(el), attrs, children),
        }
      : html(document.createElement(el), attrs, children);
  }

  if ('setAttribute' in el) {
    for (const [name, rawValue] of Object.entries(attrs)) {
      if (rawValue === undefined || name.startsWith(':')) continue;

      if (rawValue === null || rawValue === false) {
        if (el.hasAttribute(name)) el.removeAttribute(name);
      } else {
        const value = rawValue == true ? '' : String(rawValue);
        if (el.getAttribute(name) !== value) el.setAttribute(name, value);
      }
    }
  }

  for (const [rawName, value] of Object.entries(attrs)) {
    if (value === undefined || !rawName.startsWith(':')) continue;
    const name = rawName.slice(1);
    if (Reflect.get(el, name) !== value) Reflect.set(el, name, value);
  }

  let keyElements: Map<string, Element> | undefined;

  el.replaceChildren(
    ...children
      .filter((child) => child != null && child !== false)
      .map((child) => {
        if (typeof child !== 'object') return document.createTextNode(String(child));
        if (child instanceof Node) return child;

        keyElements ??= new Map(
          [...el.children].flatMap((child) => {
            const key = child.getAttribute(DATA_KEY);
            return key == null ? [] : [[key, child] as const];
          }),
        );

        const key = child.config[DATA_KEY];
        const reused = keyElements.get(key);

        if (reused && reused.tagName.toLowerCase() === child.tag) {
          keyElements.delete(key);
          return html(reused, child.config, child.children);
        }

        return child.toElement();
      }),
  );

  return el;
}
