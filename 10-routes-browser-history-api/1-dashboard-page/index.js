import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', BACKEND_URL);

  render () {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    const subElements = this.element.querySelectorAll('[data-element]');
    for (const item of subElements) {
      this.subElements[item.dataset.element] = item;
    }
    this.addComponents();
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateData(from, to);
    });
    return this.element;
  }

  get template () {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable"></div>
    </div>`;
  }

  addComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({from, to});

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    });

    const ordersChart = new ColumnChart({
      label: 'orders', link: '#', url: 'api/dashboard/orders', range: {from, to}
    });

    const salesChart = new ColumnChart({
      label: 'sales', url: 'api/dashboard/sales', range: {from, to}
    });

    const customersChart = new ColumnChart({
      label: 'customers', url: 'api/dashboard/customers', range: {from, to}
    });

    this.components = {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
      rangePicker
    };

    Object.keys(this.components).forEach(component => {
      const subEl = this.subElements[component];
      subEl.append(this.components[component].element);
    });
  }

  async updateData(from, to) {
    const data = await this.loadData(from, to);
    this.components.sortableTable.update(data);
    await this.components.ordersChart.update(from, to);
    await this.components.salesChart.update(from, to);
    await this.components.customersChart.update(from, to);
  }

  loadData(from, to) {
    const params = {
      _start: 1,
      _end: 21,
      _sort: 'title',
      _order: 'desc',
      from: from.toISOString(),
      to: to.toISOString()
    };
    this.url.search = new URLSearchParams(params).toString();
    return fetchJson(this.url);
  }

  remove () {
    this.element?.remove();
  }

  destroy () {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
