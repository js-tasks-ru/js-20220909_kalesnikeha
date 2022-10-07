export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headers = headerConfig;
    this.data = data;
    this.makeTable();
  }

  makeTable() {
    const table = document.createElement('div');
    table.innerHTML = this.getTable();
    this.element = table.firstElementChild;
    this.subElements = {body: this.element.querySelector('[data-element="body"]')};
  }

  getTable() {
    return `<div class="sortable-table">
              ${this.renderHeaders()}
              ${this.renderBody()}
            </div>`;
  }

  renderHeaders() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headers.map(item => {
        return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
                  <span>${item.title}</span>
                  <span data-element="arrow" class="sortable-table__sort-arrow">
                    <span class="sort-arrow"></span>
                  </span>
                </div>
              `;
      }).join('')}
    </div>`;
  }

  renderBody() {
    return `<div data-element="body" class="sortable-table__body">
              ${this.renderRows(this.data)}
            </div>`;
  }

  renderRows(data = []) {
    return data.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">${this.renderRow(item)}</a>`;
    }).join('');
  }

  renderRow(item) {
    return this.headers.map(header => {
      return header.template
        ? header.template(item[header.id])
        : `<div class="sortable-table__cell">${item[header.id]}</div>`;
    }).join('');
  }

  sort(field, order) {
    this.clearOtherSort();
    const sortBy = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    sortBy.dataset.order = order;
    const data = this.getSortData(field, order);
    this.subElements.body.innerHTML = this.renderRows(data);
  }

  clearOtherSort() {
    this.element.querySelectorAll('.sortable-table__cell[data-id]').forEach(column => {
      column.dataset.order = '';
    });
  }

  getSortData(field, order) {
    const column = this.headers.find(item => item.id === field);
    const direction = (order === 'asc') ? 1 : -1;
    return [...this.data].sort((a, b) => {
      if (column.sortType === 'string') {
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      } else {
        return direction * (a[field] - b[field]);
      }
    });
  }

  destroy() {
    this.element?.remove();
  }
}