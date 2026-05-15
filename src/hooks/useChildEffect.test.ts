import { describe, expect, test, vi } from 'vitest';

import { html } from '../html';
import { renderHooks } from '../test/renderHooks.ts';
import { useChildEffect } from './useChildEffect';

describe('useChildEffect', () => {
  test('runs on connect and when host children change', async () => {
    const events: string[] = [];
    const cleanup = vi.fn(() => events.push('cleanup'));
    const callback = vi.fn(() => {
      events.push('effect');
      return cleanup;
    });

    // Callback runs on connect.
    const { host } = renderHooks(() => {
      useChildEffect(callback);
    });
    expect(events).toEqual(['effect']);

    // Callback and cleanup run when a child is added.
    host.append(document.createElement('span'));
    await vi.waitFor(() => expect(events).toEqual(['effect', 'cleanup', 'effect']));

    // Callback and cleanup run when a child is removed.
    host.firstElementChild?.remove();
    await vi.waitFor(() => expect(events).toEqual(['effect', 'cleanup', 'effect', 'cleanup', 'effect']));
  });

  test('ignores descendant changes and disconnects the observer', async () => {
    const events: string[] = [];
    const cleanup = vi.fn(() => events.push('cleanup'));
    const callback = vi.fn(() => {
      events.push('effect');
      return cleanup;
    });
    let child!: HTMLSpanElement;

    const { host, disconnectedCallback } = renderHooks((host) => {
      child = html('span');
      html(host, [child]);
      useChildEffect(callback);
    });

    // Ignore the initial effects because we're only testing descendant changes
    // and observer disconnection.
    events.length = 0;

    // Adding a descendant does not run the effects.
    child.append(document.createElement('strong'));
    let observed = false;
    const observer = new MutationObserver(() => (observed = true));
    observer.observe(host, { childList: true, subtree: true });
    vi.waitFor(() => observed);
    observer.disconnect();
    expect(events).toEqual([]);

    // Cleanup is called when the host is disconnected.
    disconnectedCallback();
    expect(events).toEqual(['cleanup']);

    // Observer is disconnected when the host is disconnected.
    observed = false;
    observer.observe(host, { childList: true });
    host.append(document.createElement('span'));
    vi.waitFor(() => observer);
    expect(events).toEqual(['cleanup']);
  });
});
