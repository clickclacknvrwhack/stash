// js/api.js - API interactions
const API = {
  async analyzeStock(symbol) {
    console.log(`🚀 Analyzing ${symbol}...`);

    const response = await fetch(`/api/analyze?symbol=${symbol}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to analyze stock");
    }

    console.log("✅ Analysis successful:", data);
    return data;
  },

  async searchStocks(query) {
    // Future: implement stock search/autocomplete
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
};
