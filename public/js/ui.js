// js/ui.js - UI components and rendering
const UI = {
  elements: {
    stockInput: null,
    analyzeBtn: null,
    resultsSection: null,
    stockTitle: null,
    resultsContent: null,
  },

  init() {
    this.elements.stockInput = document.getElementById("stockInput");
    this.elements.analyzeBtn = document.getElementById("analyzeBtn");
    this.elements.resultsSection = document.getElementById("resultsSection");
    this.elements.stockTitle = document.getElementById("stockTitle");
    this.elements.resultsContent = document.getElementById("resultsContent");
  },

  setLoadingState(isLoading) {
    const { analyzeBtn, stockInput } = this.elements;

    analyzeBtn.disabled = isLoading;
    stockInput.disabled = isLoading;

    const btnText = analyzeBtn.querySelector(".btn-text");
    const btnSpinner = analyzeBtn.querySelector(".btn-spinner");

    if (isLoading) {
      btnText.style.display = "none";
      btnSpinner.style.display = "inline";
    } else {
      btnText.style.display = "inline";
      btnSpinner.style.display = "none";
    }
  },

  showResults() {
    this.elements.resultsSection.style.display = "block";
  },

  updateTitle(symbol) {
    this.elements.stockTitle.textContent = `${symbol} Analysis`;
  },

  showLoadingMessage() {
    this.elements.resultsContent.innerHTML = `
            <div class="loading">
                🔍 Fetching stock data and analyzing sentiment
            </div>
        `;
  },

  renderResults(data) {
    this.elements.resultsContent.innerHTML = `
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-label">Current Price</div>
                    <div class="metric-value">$${data.price || "N/A"}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Market Cap</div>
                    <div class="metric-value">${
                      Utils.formatMarketCap(data.marketCap) || "N/A"
                    }</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Sector</div>
                    <div class="metric-value">${data.sector || "N/A"}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Sentiment Score</div>
                    <div class="metric-value">${
                      data.sentimentScore || "Analyzing..."
                    }</div>
                </div>
            </div>
            
            ${StockChart.renderChartSection(data.symbol)}
            ${this.renderCompanyInfo(data)}
            ${this.renderNews(data)}
            ${this.renderPoliticalTrading(data)}
            ${this.renderSummary(data)}
            ${this.renderDataSource(data)}
        `;
  },

  renderCompanyInfo(data) {
    return `
            <div class="section">
                <div class="section-title">📊 Company Information</div>
                <div class="info-card">
                    <p><strong>Company:</strong> ${data.name || "N/A"}</p>
                    <p><strong>Industry:</strong> ${data.industry || "N/A"}</p>
                    <p><strong>Description:</strong> ${
                      Utils.truncateText(data.description, 200) ||
                      "No description available"
                    }</p>
                    ${
                      data.website
                        ? `<p><strong>Website:</strong> <a href="${data.website}" target="_blank" rel="noopener">${data.website}</a></p>`
                        : ""
                    }
                </div>
            </div>
        `;
  },

  renderNews(data) {
    const newsItems =
      data.news && data.news.length > 0
        ? data.news
            .map(
              (item) => `
                <div class="news-item">
                    <div class="news-title">${item.title}</div>
                    <div class="news-meta">
                        <span class="news-source">${item.source}</span>
                        <span class="news-sentiment sentiment-${item.sentiment.toLowerCase()}">${
                item.sentiment
              }</span>
                        ${
                          item.publishedDate
                            ? `<span class="news-date">${Utils.formatDate(
                                item.publishedDate
                              )}</span>`
                            : ""
                        }
                    </div>
                </div>
            `
            )
            .join("")
        : '<div class="news-item">No recent news found</div>';

    return `
            <div class="section">
                <div class="section-title">📰 Recent News & Sentiment</div>
                ${newsItems}
            </div>
        `;
  },

  renderPoliticalTrading(data) {
    return `
            <div class="section">
                <div class="section-title">🏛️ Political Trading Activity</div>
                <div class="info-card">
                    <p><strong>Feature Status:</strong> Coming Soon!</p>
                    <p>Congressional trading data will be integrated in the next version. This will show recent trades by politicians for ${data.symbol}.</p>
                </div>
            </div>
        `;
  },

  renderSummary(data) {
    return `
            <div class="section">
                <div class="section-title">🤖 AI Analysis Summary</div>
                <div class="summary-card">
                    <p>${
                      data.summary ||
                      `Analysis for ${
                        data.symbol
                      } is being generated. This MVP demonstrates the core functionality with ${
                        data.dataSource || "market data"
                      }.`
                    }</p>
                </div>
            </div>
        `;
  },

  renderDataSource(data) {
    return `
            <div class="data-source">
                <small>📊 Data Source: ${
                  data.dataSource || "Multiple APIs"
                } | Last Updated: ${Utils.formatTimestamp(
      data.timestamp
    )}</small>
            </div>
        `;
  },

  renderError(symbol, errorMessage) {
    this.elements.resultsContent.innerHTML = `
            <div class="error-card">
                <h3>❌ Analysis Failed</h3>
                <p>Unable to analyze <strong>${symbol}</strong></p>
                <p><strong>Error:</strong> ${errorMessage}</p>
                <div class="error-suggestions">
                    <p><strong>Suggestions:</strong></p>
                    <ul>
                        <li>Check that the stock symbol is correct (e.g., AAPL, TSLA, GOOGL)</li>
                        <li>Try a different stock symbol</li>
                        <li>Wait a moment and try again</li>
                    </ul>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">💡 Try These Popular Stocks</div>
                <div class="stock-suggestions">
                    ${["AAPL", "TSLA", "GOOGL", "MSFT", "NVDA", "AMZN"]
                      .map(
                        (sym) =>
                          `<button class="suggestion-btn" onclick="App.searchStock('${sym}')">${sym}</button>`
                      )
                      .join("")}
                </div>
            </div>
        `;
  },
};
