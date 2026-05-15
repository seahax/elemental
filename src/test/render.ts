export function render(component: CustomElementConstructor): HTMLElement {
  window.customElements.define('test-component-' + window.crypto.randomUUID(), component);
  const element = new component();
  element.className = 'test-component';
  document.body.appendChild(element);
  return element;
}
