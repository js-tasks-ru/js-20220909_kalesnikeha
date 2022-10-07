export default class NotificationMessage {
  message;
  duration;
  type;
  element;


  constructor(message = '', options = {duration: 2000, type: 'success'}) {
    this.message = message;
    Object.assign(this, {...options});
    this.createElement();
  }

  createElement() {
    const element = document.createElement('div');
    element.innerHTML = this.getBody();
    this.element = element.firstElementChild;
  }

  getBody() {
    return `
            <div class="notification ${this.type}" style="--value: ${this.duration}ms">
                <div class="timer"></div>
                <div class="inner-wrapper">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.message}
                    </div>
                </div>
            </div>
        `;
  }

  show(elem = document.body) {
    elem.append(this.element);
    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    this.destroy();
  }

  destroy() {
    this.element?.remove();
  }
}
