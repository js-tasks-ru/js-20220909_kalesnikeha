export default class ColumnChart {
  chartHeight = 50;

  constructor(data) {
    this.data = data;
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.makeChart();
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
    if (!this.data) {
      this.element.classList.add("column-chart_loading");
      return;
    }

    const chartValue = this.element.querySelector(".column-chart__header");
    const chartTitle = this.element.querySelector(".column-chart__title");

    if (this.data.link) {
      const link = document.createElement("a");
      link.className = "column-chart__link";
      link.href = this.data.link;
      link.textContent = "View all";
      chartTitle.append(link);
    }

    if (this.data.label) {
      let labelToChange = this.data.label.charAt(0).toUpperCase() + this.data.label.slice(1);
      chartTitle.prepend(labelToChange);
    }

    if (this.data.value) {
      if (this.data.formatHeading) {
        chartValue.innerHTML = this.data.formatHeading(this.data.value);
      } else {
        chartValue.innerHTML = this.data.value;
      }
    }

    if (this.data.data && this.data.data.length !== 0) {
      this.update(this.data.data);
    }
  }

  remove() {
    this.element.remove();
  }

  update(data) {
    const chartsContainer = this.element.querySelector(".column-chart__chart");
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    chartsContainer.innerHTML = data.map(value => {
      const val = Math.floor(value * scale);
      const tooltip = ((value / maxValue) * 100).toFixed(0);
      return `<div style="--value: ${val}" data-tooltip="${tooltip + "%"}"></div>`;
    }).join("");
  }

  destroy() {
    this.remove();
  }
}
