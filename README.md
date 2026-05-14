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

[![NPM](https://img.shields.io/npm/v/%40seahax%2Felemental?style=for-the-badge&color=red)](https://www.npmjs.com/package/@seahax/elemental) [![BundleJS (GZIP)](https://img.shields.io/bundlejs/size/%40seahax/elemental?style=for-the-badge&label=bundlejs%20(gzip))
](https://bundlejs.com/?q=%40seahax%2Felemental%40latest&treeshake=%5B*%5D)


## Define A Web Component

```ts
import {
  defineComponent,
  h,
  useRef,
  useStore,
  useAttributes,
  useParent,
  useDocument,
  useRoute,
  useAsync,
  useEffect,
  useChildEffect,
  useDisconnectCallback,
  useElementInternals,
  useHost,
} from '@seahax/elemental';

export const MyComponent = defineComponent((shadow) => {
  // This function is called every time the component is connected to the
  // document.
  // 
  // For the most part, a component's lifecycle should be handled as if it
  // starts on connect and ends on disconnect, even though the component
  // can be reconnected to the document. Restore internal state on
  // connection from host attributes and properties. Effect hooks are
  // designed to facilitate this pattern.

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

  // Use references (reactive state) bound to the component's attributes.
  const [dataValueRef, ...] = useAttributes('data-value', ...);

  // Use a reference (reactive state) bound to the component's parent node.
  const parentNode = useParent();

  // Use a reference (reactive state) bound to the component's owner document.
  const ownerDocument = useDocument();

  // Use a reference (reactive state) bound to route matching.
  const routeMatchRef = useRoute('/path/', {
    match: 'prefix', // 'exact' | 'prefix' | RegExp
    source: 'pathname', // 'pathname' | 'hash'
  });

  // Use a reference (reactive state) bound to an async loader function.
  const asyncRef = useAsync([
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
    asyncRef,
  ], (...dependencyValues) => {
    // Reactive code runs when the component is connected to the document,
    // and when any of the dependencies change.

    return () => {
      // Cleanup after dependency refs are changed (before the next effect
      // callback) and after the component is disconnected from the
      // document.
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

  // Register a document disconnection callback.
  useDisconnectCallback(() => {
    // Called when the component is disconnected from the document.
  });

  // Use the element's internals.
  const elementInternals = useElementInternals();

  // Use the component host element.
  const host = useHost();
});
```

## Enable Form Association

```ts
import {
  useElementInternals,
  useForm,
  useFormDisabled,
  useFormResetCallback,
  useFormRestoreCallback,
} from '@seahax/elemental';

const MyComponent = defineComponent(
  (shadow) => {
    // Use the element's internals.
    const elementInternals = useElementInternals();

    // Use a reference (reactive state) bound to the associated form.
    const formRef = useForm();

    // Use a reference (reactive state) bound to the form disabled state.
    const formDisabledRef = useFormDisabled();

    // Register a form reset callback.
    useFormResetCallback(() => {
      // Called when the associated form is reset. Only called on connect
      // if the form was reset while the component was disconnected.
    });

    // Register a form restore callback.
    useFormRestoreCallback((state, reason) => {
      // Called when the associated form is restored. Only called on connect
      // if the form was restored while the component was disconnected.
    });
  },
  {
    // Enable form association.
    formAssociated: true,
  }
);
```

## Customize The Shadow Root

```ts
const MyComponent = defineComponent(
  (shadow) => {
    ...
  },
  {
    // Use custom shadow root initialization options.
    // (default: { mode: 'open' }).
    shadow: {
      mode: 'closed',
      ...
    },
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
