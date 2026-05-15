import { describe, expect, test, vi } from 'vitest';

import { defineComponent } from './defineComponent';
import { useDisconnectCallback } from './hooks/useDisconnect';
import { useEffect } from './hooks/useEffect';
import { html as h } from './html';
import { render } from './test/render.ts';

describe('defineComponent', () => {
  test('connect and render', () => {
    const Component = defineComponent((shadow) => {
      h(shadow, [h('div', { class: 'foo' }, [h('p', ['Hello, World!'])])]);
    });

    const el = render(Component);
    expect(el.shadowRoot?.innerHTML).toMatchInlineSnapshot(`"<div class="foo"><p>Hello, World!</p></div>"`);
  });

  test('effect and disconnect', () => {
    const effectCleanupHandler = vi.fn();
    const effectHandler = vi.fn().mockReturnValue(effectCleanupHandler);
    const disconnectHandler = vi.fn();
    const Component = defineComponent(() => {
      useEffect([], effectHandler);
      useDisconnectCallback(disconnectHandler);
    });

    const el = render(Component);
    expect(effectHandler).toHaveBeenCalledOnce();
    expect(effectCleanupHandler).not.toHaveBeenCalled();
    expect(disconnectHandler).not.toHaveBeenCalled();

    el.remove();
    expect(disconnectHandler).toHaveBeenCalledOnce();
    expect(effectCleanupHandler).toHaveBeenCalledOnce();
  });
});
