import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  element
  subElements ={}

  constructor({
    label = '',
    link = '',
    value = 0,
    formatHeading = format => format,
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    }
  } = {}) {
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.url = new URL(url, BACKEND_URL);
    this.range = range;

    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.makeChart();
    const subElements = this.element.querySelectorAll('[data-element]');
    for (const item of subElements) {
      this.subElements[item.dataset.element] = item;
    }
    this.update(this.range.from, this.range.to);
  }

  getTemplate() {
    return `
      <div class="column-chart" style="--chart-height: 50">
        <div class="column-chart__title"></div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart">
            <div style="--value: 1" data-tooltip="3%"></div>
          </div>
        </div>
      </div>`;
  }

  makeChart() {
    const chartValue = this.element.querySelector(".column-chart__header");
    const chartTitle = this.element.querySelector(".column-chart__title");

    if (this.link) {
      const link = document.createElement("a");
      link.className = "column-chart__link";
      link.href = this.link;
      link.textContent = "View all";
      chartTitle.append(link);
    }

    if (this.label) {
      let labelToChange = this.label.charAt(0).toUpperCase() + this.label.slice(1);
      chartTitle.prepend(labelToChange);
    }

    if (this.value) {
      if (this.formatHeading) {
        chartValue.innerHTML = this.formatHeading(this.value);
      } else {
        chartValue.innerHTML = this.value;
      }
    }
  }

  remove() {
    this.element.remove();
  }

  async update(from, to) {
    this.element.classList.add("column-chart_loading");
    const chartsContainer = this.element.querySelector(".column-chart__chart");
    const params = {
      from: from.toISOString(),
      to: to.toISOString()
    };
    this.url.search = new URLSearchParams(params).toString();
    const data = await fetchJson(this.url);
    let values = Object.values(data);
    const maxValue = Math.max(...values);
    const scale = this.chartHeight / maxValue;

    chartsContainer.innerHTML = values.map(value => {
      const val = Math.floor(value * scale);
      const tooltip = ((value / maxValue) * 100).toFixed(0);
      return `<div style="--value: ${val}" data-tooltip="${tooltip + "%"}"></div>`;
    }).join("");
    this.element.classList.remove("column-chart_loading");
    return data;
  }

  destroy() {
    this.remove();
  }
}

