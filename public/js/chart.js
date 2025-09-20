// js/chart.js - Stock chart functionality
const StockChart = {
  currentChart: null,
  currentData: null,
  currentSymbol: null,

  init() {
    // Chart will be initialized when stock data is loaded
  },

  async fetchChartData(symbol) {
    try {
      // Try to get real historical data (you can add this API endpoint later)
      const response = await fetch(`/api/chart?symbol=${symbol}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Chart API unavailable, generating mock data");
    }

    // Generate mock chart data for now
    return this.generateMockChartData(symbol);
  },

  generateMockChartData(symbol) {
    const days = 30;
    const data = [];
    let basePrice = Math.random() * 200 + 50;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Simulate realistic price movement
      const volatility = 0.02; // 2% daily volatility
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      basePrice = Math.max(basePrice * (1 + randomChange), 10);

      data.push({
        date: date.toISOString().split("T")[0],
        price: Number(basePrice.toFixed(2)),
        volume: Math.floor(Math.random() * 50000000) + 5000000,
        high: Number((basePrice * 1.02).toFixed(2)),
        low: Number((basePrice * 0.98).toFixed(2)),
      });
    }

    return data;
  },

  createChart(chartData, symbol) {
    const canvas = document.getElementById("stockChart");
    if (!canvas) {
      console.error("Chart canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");

    // Destroy existing chart
    if (this.currentChart) {
      this.currentChart.destroy();
    }

    // Store data for chart type switching
    this.currentData = chartData;
    this.currentSymbol = symbol;

    const labels = chartData.map((d) => this.formatChartDate(d.date));
    const prices = chartData.map((d) => d.price);

    this.currentChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: `${symbol} Price ($)`,
            data: prices,
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointRadius: 1,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "white",
            bodyColor: "white",
            borderColor: "#667eea",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `Price: $${context.parsed.y.toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Date",
            },
            grid: {
              display: false,
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Price ($)",
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
        },
      },
    });
  },

  updateChart(type) {
    if (!this.currentData || !this.currentChart) return;

    // Update active button
    document.querySelectorAll(".chart-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    event.target.classList.add("active");

    const labels = this.currentData.map((d) => this.formatChartDate(d.date));
    let data, label, color;

    switch (type) {
      case "price":
        data = this.currentData.map((d) => d.price);
        label = `${this.currentSymbol} Price ($)`;
        color = "#667eea";
        this.currentChart.options.scales.y.title.text = "Price ($)";
        break;
      case "volume":
        data = this.currentData.map((d) => d.volume);
        label = `${this.currentSymbol} Volume`;
        color = "#764ba2";
        this.currentChart.options.scales.y.title.text = "Volume";
        break;
      default:
        return;
    }

    // Update chart data
    this.currentChart.data.labels = labels;
    this.currentChart.data.datasets[0] = {
      label: label,
      data: data,
      borderColor: color,
      backgroundColor: `${color}20`,
      borderWidth: 2,
      fill: true,
      tension: 0.1,
      pointRadius: 1,
      pointHoverRadius: 5,
    };

    this.currentChart.update();
  },

  formatChartDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  },

  renderChartSection(symbol) {
    return `
            <div class="chart-section">
                <div class="chart-header">
                    <div class="chart-title">📈 ${symbol} Price Chart (30 Days)</div>
                    <div class="chart-controls">
                        <button class="chart-btn active" onclick="StockChart.updateChart('price')">Price</button>
                        <button class="chart-btn" onclick="StockChart.updateChart('volume')">Volume</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="stockChart"></canvas>
                </div>
            </div>
        `;
  },
};

// Make updateChart available globally for onclick handlers
window.updateChart = (type) => StockChart.updateChart(type);
