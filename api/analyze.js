// api/analyze.js - Clean stock analysis API endpoint
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Stock symbol is required" });
  }

  try {
    console.log(`🔍 Analyzing stock: ${symbol}`);

    // Generate mock data for testing
    const mockData = generateStockData(symbol.toUpperCase());

    res.json(mockData);
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({
      error: "Analysis failed",
      symbol: symbol,
      message: error.message,
    });
  }
}

function generateStockData(symbol) {
  const stockDatabase = {
    AAPL: {
      name: "Apple Inc.",
      price: 175.25,
      marketCap: 2800000000000,
      sector: "Technology",
      industry: "Consumer Electronics",
    },
    TSLA: {
      name: "Tesla Inc.",
      price: 248.5,
      marketCap: 780000000000,
      sector: "Consumer Discretionary",
      industry: "Auto Manufacturers",
    },
    GOOGL: {
      name: "Alphabet Inc.",
      price: 138.75,
      marketCap: 1700000000000,
      sector: "Technology",
      industry: "Internet Content & Information",
    },
    MSFT: {
      name: "Microsoft Corporation",
      price: 415.2,
      marketCap: 3100000000000,
      sector: "Technology",
      industry: "Software Infrastructure",
    },
    NVDA: {
      name: "NVIDIA Corporation",
      price: 465.85,
      marketCap: 1150000000000,
      sector: "Technology",
      industry: "Semiconductors",
    },
    AMZN: {
      name: "Amazon.com Inc.",
      price: 155.3,
      marketCap: 1600000000000,
      sector: "Consumer Discretionary",
      industry: "Internet Retail",
    },
  };

  const stock = stockDatabase[symbol] || {
    name: `${symbol} Corporation`,
    price: Math.random() * 200 + 50,
    marketCap: Math.random() * 1000000000000 + 50000000000,
    sector: "Unknown",
    industry: "Unknown",
  };

  const newsData = [
    {
      title: `${symbol} reports strong quarterly earnings`,
      source: "Financial Times",
      sentiment: "Positive",
      publishedDate: "2025-09-18",
    },
    {
      title: `Analysts upgrade ${symbol} price target`,
      source: "MarketWatch",
      sentiment: "Positive",
      publishedDate: "2025-09-17",
    },
    {
      title: `${symbol} announces strategic partnership`,
      source: "Reuters",
      sentiment: "Positive",
      publishedDate: "2025-09-16",
    },
  ];

  return {
    symbol: symbol,
    name: stock.name,
    price: Number(stock.price).toFixed(2),
    marketCap: stock.marketCap,
    sector: stock.sector,
    industry: stock.industry,
    description: `${stock.name} is a leading company in the ${stock.sector} sector. This analysis uses mock data for MVP demonstration purposes.`,
    sentimentScore: "Positive (78%)",
    news: newsData,
    summary: `${symbol} shows positive market sentiment based on recent analysis. Trading at $${Number(
      stock.price
    ).toFixed(2)} with strong fundamentals in the ${
      stock.sector
    } sector. This assessment uses mock data for demonstration.`,
    timestamp: new Date().toISOString(),
    dataSource: "Mock Data (MVP Demo)",
  };
}
