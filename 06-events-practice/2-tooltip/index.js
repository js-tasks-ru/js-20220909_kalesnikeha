class Tooltip {
  static #instance;
  element;

  constructor() {
    if (Tooltip.#instance) {
      return Tooltip.#instance;
    }
    Tooltip.#instance = this;
  }

  initialize() {
    document.addEventListener('pointerover', this.overEvent);
    document.addEventListener('pointerout', this.outEvent);
  }

  overEvent = event => {
    const target = event.target.closest('[data-tooltip]');
    if (target) {
      this.render(target.dataset.tooltip);
      document.addEventListener('pointermove', this.moveEvent);
    }
  };

  render(html) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;
    document.body.append(this.element);
  }

  outEvent = () => {
    this.element?.remove();
    document.removeEventListener('pointermove', this.moveEvent);
  };

  moveEvent = e => {
    this.element.style.left = `${e.clientX}px`;
    this.element.style.top = `${e.clientY}px`;
  }

  destroy() {
    document.removeEventListener('pointerover', this.overEvent);
    document.removeEventListener('pointerout', this.outEvent);
    document.removeEventListener('pointermove', this.moveEvent);
    this.element?.remove();
    this.element = null;
  }
}

export default Tooltip;
