// js/app.js - Main application logic
const App = {
  init() {
    console.log("🚀 Stock Intelligence Engine loaded!");

    UI.init();
    this.bindEvents();
    this.handleUrlParams();
  },

  bindEvents() {
    const { stockInput, analyzeBtn } = UI.elements;

    analyzeBtn.addEventListener("click", () => this.analyzeStock());
    stockInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.analyzeStock();
    });

    // Add browser history support
    window.addEventListener("popstate", (event) => {
      if (event.state && event.state.symbol) {
        stockInput.value = event.state.symbol;
        this.analyzeStock();
      }
    });
  },

  handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get("symbol");

    if (symbol) {
      UI.elements.stockInput.value = symbol.toUpperCase();
      this.analyzeStock();
    }
  },

  async analyzeStock() {
    const symbol = UI.elements.stockInput.value.trim().toUpperCase();

    if (!symbol) {
      alert("Please enter a stock symbol");
      return;
    }

    try {
      UI.setLoadingState(true);
      UI.showResults();
      UI.updateTitle(symbol);
      UI.showLoadingMessage();

      const data = await API.analyzeStock(symbol);

      // Add this line - fetch chart data
      const chartData = await StockChart.fetchChartData(symbol);

      UI.renderResults(data);

      // Add this line - create the chart
      StockChart.createChart(chartData, symbol);

      this.addToHistory(symbol);
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      UI.renderError(symbol, error.message);
    } finally {
      UI.setLoadingState(false);
    }
  },

  searchStock(symbol) {
    UI.elements.stockInput.value = symbol;
    this.analyzeStock();
  },

  addToHistory(symbol) {
    const url = new URL(window.location);
    url.searchParams.set("symbol", symbol);
    history.pushState({ symbol }, `${symbol} Analysis`, url);
  },
};

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
