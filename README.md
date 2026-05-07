# @seahax/elemental

Functional, reactive, web component base library.

Contains everything you need to build anything from a single component up to a full reactive application, with minimal overhead.

- Create fully portable web components
- Direct and safe access to the DOM (no virtual DOM)
- React-style list rendering using unique keys
- React-style code reuse using composable hooks
- Global & local state reactivity
- Client-side routing
- No Build Tooling
- No Dependencies
- Tiny Bundle Size

![NPM Version](https://img.shields.io/npm/v/@seahax/elemental?color=red)
[![bundlejs](https://deno.bundlejs.com/badge?q=@seahax/elemental@latest&treeshake=[*])](https://bundlejs.com/?q=%40seahax%2Felemental%40latest&treeshake=%5B*%5D)


## Define A Web Component

```ts
import {
  defineComponent,
  useRef,
  useStore,
  useAttributes,
  useRoute,
  useLoading,
  useEffect,
  useChildEffect,
  useHost,
  h,
} from '@seahax/elemental';

export const MyComponent = defineComponent((shadow) => {
  // This function is run once after the component is created, when it is
  // first connected to the document.

  // Create HTML elements and save references to them.
  const myInput = h('input');

  // Render content to the shadow DOM.
  h(shadow, [
    h('style', [/* css */]),
    h('p', { class: 'hello' }, ['Hello, World!']),
    h('div', { class: 'inputs' }, [
      myInput,
    ]),
  ]);

  // Use a reference (reactive state) value.
  const localStateRef = useRef('initial value', (newValue) => {
    // Handle
  });

  // Use a reference (reactive state) bound to a (shared) store.
  const globalStateRef = useStore(myStore, select, mutate);

  // Use references (reactive state) bound to attributes.
  const [dataValueRef, ...] = useAttributes('data-value', ...);

  // Use a reference (reactive state) bound to route matching.
  const routeMatchRef = useRoute('/path/', {
    match: 'prefix', // 'exact' | 'prefix' | RegExp
    source: 'pathname', // 'pathname' | 'hash'
  });

  // Use a reference (reactive state) bound to an async loader function.
  const loadingStateRef = useLoading([
    // dependency references
  ], async (signal, ...dependencyValues) => {
    // Reactive async code runs when the component is connected to the
    // document, and when any of the dependencies change. The signal is
    // aborted if the dependencies change before the promise returned by
    // this function is resolved.
  });

  // React to reference changes.
  useEffect([
    // dependency references
    localStateRef,
    globalStateRef,
    dataValueRef,
    routeMatchRef,
    routeStateRef,
    loadingStateRef,
  ], (...dependencyValues) => {
    // Reactive code runs when the component is connected to the document,
    // and when any of the dependencies change.

    return () => {
      // Cleanup before the next effect callback and after the component
      // is disconnected from the document.
    };
  });

  // React to child list changes.
  useChildEffect(() => {
    // Reactive code runs when the component is connected to the document,
    // and when the children of the component change. Access the current
    // children using the `shadow.host.children` property.

    return () => {
      // Cleanup before the next effect callback and after the component
      // is disconnected from the document.
    };
  });

  // Use the host element (generally only useful in reusable hooks).
  const host = useHost();
});
```

## Customize The Shadow Root

```ts
const MyComponent = defineComponent(
  (shadow) => {
    // Renderer...
  },
  {
    // Shadow root options.
    shadow: {
      mode: 'closed',
      ...
    }
  }
);
```

## Add Web Component Properties

```ts
interface Props {
  checked: boolean;
}

const MyComponent = defineComponent<Props>(
  (shadow, propRefs) => {
    // Get properties (the ref value is initially undefined).
    const isChecked = propRefs.checked.value ?? shadow.host.hasAttribute('checked');

    // Set properties.
    propRefs.checked.value = true;

    // Alternatively, access the property on the host element.
    const isChecked = shadow.host.checked;
    shadow.host.checked = true;

    // React to property changes.
    useEffect([propRefs.checked], (checked) => {
      ...
    });
  },
  {
    props: {
      // Return a property descriptor that uses a pre-defined ref and the
      // host element. The property descriptor must have a `get` function,
      // `value` is not allowed, and all other properties are optional.
      // The ref value is initially undefined.
      checked: (ref, host) => {
        return {
          get: () => ref.value ?? host.hasAttribute('checked'),
          set: (value) => (ref.value = value),
        };
      },
    },
  }),
);

const element = new MyComponent();

// Properties are defined publicly on component (`HTMLElement`) instances.
element.checked = true;
```

## Render An Element

```ts
// By tag name.
const element = h('div', {
  // Set attributes.
  class: 'my-class',
  // Set properties.
  ':id': 'my-id',
}, [
  // Set children.
  h('p', [text]),
]);

// By custom element constructor.
const element = h(MyComponent, {
  // Set attributes.
  class: 'my-class',
  // Set properties.
  ':id': 'my-id',
}, [
  // Set children.
  h('p', [text]),
]);
```

## Update An Element

```ts
// Update an existing element.
h(element, {
  // Set attributes.
  class: 'my-class',
  // Remove attributes.
  class: null,
  // Set properties.
  ':id': 'my-id',
  // Attributes and properties that are not provided are left alone.
}, [
  // Replace all children. Children are left alone if no child array is
  // provided (undefined or omitted).
  h('p', [text]),
]);
```

## Render Lists With Keys

```ts
// Create a reusable root element.
const parent = h('div');

h(parent, items.map((item) => {
  // No previous children, so all children will be created.
  return h('p', { 'data-key': item.id }, [item.text]);
}));

// Update children with matching keys.
h(parent, items.map((item) => {
  // Second render, so reuse (and update) children with matching keys.
  return h('p', { 'data-key': item.id }, [item.text]);
}));
```
