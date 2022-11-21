import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  isSortLocally

  constructor(headersConfig, {
    isSortLocally,
    url,
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    start = 1,
    step = 10
  } = {}) {
    this.isSortLocally = isSortLocally;
    this.headers = headersConfig;
    this.sorted = sorted;
    this.start = start;
    this.step = step;
    this.end = start + step;
    this.url = new URL(url, BACKEND_URL);
    this.render();
  }

  async render() {
    const table = document.createElement('div');
    table.innerHTML = this.getTable();
    this.element = table.firstElementChild;
    const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
    const subElements = this.element.querySelectorAll('[data-element]');
    for (const item of subElements) {
      this.subElements[item.dataset.element] = item;
    }
    this.data = data;
    this.subElements.body.innerHTML = this.renderRows(data);
    this.subElements.header.addEventListener('pointerdown', this.clickSortEvent);
    window.addEventListener('scroll', this.infinityScroll);
  }

  async loadData(id, order, start = this.start, end = this.end) {
    const params = {
      _sort: id,
      _order: order,
      _start: start,
      _end: end
    };
    this.url.search = new URLSearchParams(params).toString();
    this.element.classList.add('sortable-table_loading');
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');
    return data;
  }

  infinityScroll = () => {
    const bottom = this.element.getBoundingClientRect().bottom;
    const clientHeight = document.documentElement.clientHeight;
    if (bottom < clientHeight && !this.loading) {
      this.start = this.end;
      this.end = this.start + this.step;
      this.loading = true;
      this.loadData(this.sorted.id, this.sorted.order, this.start, this.end)
        .then(data => {
          this.data = [...this.data, ...data];
          this.subElements.body.innerHTML += this.renderRows(data);
          this.loading = false;
        })
        .catch(e => {
          alert(e.message());
        });
    }
  }

  clickSortEvent = e => {
    const sortBy = e.target.closest('[data-sortable="true"]');
    if (sortBy) {
      const { id, order } = sortBy.dataset;
      const direction = (order && order === 'desc') ? 'asc' : 'desc';
      this.sort(id, direction);
    }
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
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    this.clearOtherSort();
    const sortBy = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    sortBy.dataset.order = order;
    const data = this.getSortData(field, order);
    this.subElements.body.innerHTML = this.renderRows(data);
  }

  async sortOnServer(id, order) {
    this.clearOtherSort();
    const sortBy = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);
    sortBy.dataset.order = order;
    const start = 1;
    const end = 1 + this.step;
    const data = await this.loadData(id, order, start, end);
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
