import { afterEach } from 'vitest';

import { html } from '../html';
import { type Controller, createController } from '../internal/createController';

const controllers = new Set<Controller>();

class TestHost extends HTMLElement {
  static formAssociated = true;
}

window.customElements.define('test-render-hooks-host', TestHost);

afterEach(() => {
  for (const controller of controllers) {
    controller.host.remove();
    controller.disconnectedCallback();
  }

  controllers.clear();
});

export function renderHooks(callback: (host: HTMLElement) => void): Controller {
  const host = html(TestHost);
  const internals = host.attachInternals();
  document.body.append(host);

  const controller = createController({
    host,
    formAssociated: true,
    render: () => callback(host),
    attachInternals: () => internals,
  });

  controllers.add(controller);
  controller.connectedCallback();
  return controller;
}
