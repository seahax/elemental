import { describe, expect, test, vi } from 'vitest';

import { renderHooks } from '../test/renderHooks.ts';
import { useAttributes } from './useAttributes';
import { useHost } from './useHost';
import type { Ref } from './useRef';

describe('useAttributes', () => {
  test('binds refs to host attributes', async () => {
    let dataValueRef!: Ref<string | null>;
    let ariaLabelRef!: Ref<string | null>;

    const { host } = renderHooks(() => {
      const host = useHost();
      host.setAttribute('data-value', 'initial');
      [dataValueRef, ariaLabelRef] = useAttributes('data-value', 'aria-label');
    });

    // Refs are initialized to the initial attribute values.
    expect(dataValueRef.value).toBe('initial');
    expect(ariaLabelRef.value).toBeNull();

    // Updating the refs updates the host attributes.
    dataValueRef.value = 'updated';
    ariaLabelRef.value = 'Label';
    expect(host.getAttribute('data-value')).toBe('updated');
    expect(host.getAttribute('aria-label')).toBe('Label');

    // Setting a ref to null removes the attribute.
    dataValueRef.value = null;
    expect(host.hasAttribute('data-value')).toBe(false);

    // Updating the host attributes updates the refs.
    host.setAttribute('aria-label', 'External label');
    vi.waitFor(() => expect(ariaLabelRef.value).toBe('External label'));

    // Removing the attribute updates the ref to null.
    host.removeAttribute('aria-label');
    vi.waitFor(() => expect(ariaLabelRef.value).toBeNull());
  });
});
