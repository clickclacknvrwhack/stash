// api/analyze.js - Stock analysis API endpoint
export default async function handler(req, res) {
  // CORS headers for cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Stock symbol is required" });
  }

  try {
    console.log(`🔍 Analyzing stock: ${symbol}`);

    // Try to fetch real data first, fallback to mock data
    let stockData;

    try {
      stockData = await fetchRealStockData(symbol.toUpperCase());
    } catch (error) {
      console.log("Real API failed, using mock data:", error.message);
      stockData = generateMockData(symbol.toUpperCase());
    }

    res.json(stockData);
  } catch (error) {
    console.error("❌ Analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze stock",
      symbol: symbol,
      message: error.message,
    });
  }
}

// Fetch real stock data using Financial Modeling Prep API
async function fetchRealStockData(symbol) {
  const apiKey = process.env.FMP_API_KEY || "demo";

  if (apiKey === "demo") {
    throw new Error("No API key configured - using mock data");
  }

  // Fetch stock profile data
  const profileResponse = await fetch(
    `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`
  );

  if (!profileResponse.ok) {
    throw new Error(`FMP API error: ${profileResponse.status}`);
  }

  const profileData = await profileResponse.json();

  if (!profileData || profileData.length === 0) {
    throw new Error(`No data found for symbol: ${symbol}`);
  }

  const stock = profileData[0];

  // Fetch recent news
  let newsData = [];
  try {
    const newsResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=5&apikey=${apiKey}`
    );

    if (newsResponse.ok) {
      const rawNews = await newsResponse.json();
      newsData = rawNews.slice(0, 5).map((article) => ({
        title: article.title,
        source: article.site || "Financial News",
        sentiment: analyzeSentimentSimple(article.title),
        url: article.url,
        publishedDate: article.publishedDate,
      }));
    }
  } catch (newsError) {
    console.log("News fetch failed:", newsError);
    newsData = generateMockNews(symbol);
  }

  return {
    symbol: symbol,
    name: stock.companyName,
    price: Number(stock.price).toFixed(2),
    marketCap: stock.mktCap,
    sector: stock.sector,
    industry: stock.industry,
    website: stock.website,
    description: stock.description,
    sentimentScore: calculateOverallSentiment(newsData),
    news: newsData,
    summary: generateSummary(stock, newsData),
    timestamp: new Date().toISOString(),
    dataSource: "Financial Modeling Prep",
  };
}

// Generate mock data for testing and fallback
function generateMockData(symbol) {
  console.log(`📊 Generating mock data for ${symbol}`);

  const mockStocks = {
    AAPL: {
      name: "Apple Inc.",
      price: 175.25,
      marketCap: 2800000000000,
      sector: "Technology",
      industry: "Consumer Electronics",
      description:
        "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
    },
    TSLA: {
      name: "Tesla Inc.",
      price: 248.5,
      marketCap: 780000000000,
      sector: "Consumer Discretionary",
      industry: "Auto Manufacturers",
      description:
        "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.",
    },
    GOOGL: {
      name: "Alphabet Inc.",
      price: 138.75,
      marketCap: 1700000000000,
      sector: "Technology",
      industry: "Internet Content & Information",
      description:
        "Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.",
    },
    MSFT: {
      name: "Microsoft Corporation",
      price: 415.2,
      marketCap: 3100000000000,
      sector: "Technology",
      industry: "Software Infrastructure",
      description:
        "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.",
    },
    NVDA: {
      name: "NVIDIA Corporation",
      price: 465.85,
      marketCap: 1150000000000,
      sector: "Technology",
      industry: "Semiconductors",
      description:
        "NVIDIA Corporation operates as a computing company in the United States, Taiwan, China, Hong Kong, and internationally.",
    },
  };

  const stockData = mockStocks[symbol] || {
    name: `${symbol} Corporation`,
    price: Math.random() * 200 + 50,
    marketCap: Math.random() * 1000000000000 + 50000000000,
    sector: "Unknown",
    industry: "Unknown",
    description: `${symbol} is a publicly traded company. This is mock data for demonstration purposes.`,
  };

  const newsData = generateMockNews(symbol);

  return {
    symbol: symbol,
    name: stockData.name,
    price: Number(stockData.price).toFixed(2),
    marketCap: stockData.marketCap,
    sector: stockData.sector,
    industry: stockData.industry,
    description: stockData.description,
    sentimentScore: calculateOverallSentiment(newsData),
    news: newsData,
    summary: generateSummary(stockData, newsData),
    timestamp: new Date().toISOString(),
    dataSource: "Mock Data (MVP Demo)",
  };
}

// Generate mock news data
function generateMockNews(symbol) {
  const newsTemplates = [
    {
      title: `${symbol} reports strong quarterly earnings, beats analyst expectations`,
      source: "Financial Times",
      sentiment: "Positive",
    },
    {
      title: `Analysts upgrade ${symbol} price target following strong performance`,
      source: "MarketWatch",
      sentiment: "Positive",
    },
    {
      title: `${symbol} announces strategic partnership to expand market reach`,
      source: "Reuters",
      sentiment: "Positive",
    },
    {
      title: `Market volatility creates uncertainty for ${symbol} investors`,
      source: "Bloomberg",
      sentiment: "Neutral",
    },
    {
      title: `${symbol} stock shows resilience despite broader market concerns`,
      source: "Yahoo Finance",
      sentiment: "Positive",
    },
    {
      title: `Institutional investors increase holdings in ${symbol}`,
      source: "Seeking Alpha",
      sentiment: "Positive",
    },
  ];

  // Return 3-5 random news items
  const shuffled = newsTemplates.sort(() => 0.5 - Math.random());
  const numArticles = Math.floor(Math.random() * 3) + 3; // 3-5 articles

  return shuffled.slice(0, numArticles).map((article) => ({
    ...article,
    url: `https://example.com/news/${symbol.toLowerCase()}`,
    publishedDate: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0],
  }));
}

// Simple sentiment analysis using keywords
function analyzeSentimentSimple(text) {
  const positiveWords = [
    "strong",
    "beats",
    "exceeds",
    "grows",
    "gains",
    "rises",
    "bullish",
    "positive",
    "upgrade",
    "outperforms",
    "success",
    "partnership",
    "expansion",
    "breakthrough",
  ];

  const negativeWords = [
    "falls",
    "drops",
    "declines",
    "bearish",
    "negative",
    "concerns",
    "volatility",
    "downgrade",
    "misses",
    "disappoints",
    "struggles",
    "challenges",
    "uncertainty",
  ];

  const lowerText = text.toLowerCase();

  const positiveCount = positiveWords.reduce(
    (count, word) => count + (lowerText.includes(word) ? 1 : 0),
    0
  );

  const negativeCount = negativeWords.reduce(
    (count, word) => count + (lowerText.includes(word) ? 1 : 0),
    0
  );

  if (positiveCount > negativeCount) return "Positive";
  if (negativeCount > positiveCount) return "Negative";
  return "Neutral";
}

// Calculate overall sentiment score from news articles
function calculateOverallSentiment(newsData) {
  if (!newsData || newsData.length === 0) {
    return "Neutral (No data)";
  }

  const sentimentCounts = newsData.reduce((counts, article) => {
    counts[article.sentiment] = (counts[article.sentiment] || 0) + 1;
    return counts;
  }, {});

  const total = newsData.length;
  const positive = Math.round(((sentimentCounts.Positive || 0) / total) * 100);
  const negative = Math.round(((sentimentCounts.Negative || 0) / total) * 100);
  const neutral = Math.round(((sentimentCounts.Neutral || 0) / total) * 100);

  if (positive >= 60) return `Very Positive (${positive}%)`;
  if (positive >= 40) return `Positive (${positive}%)`;
  if (negative >= 60) return `Very Negative (${negative}%)`;
  if (negative >= 40) return `Negative (${negative}%)`;
  return `Mixed (${positive}% pos, ${negative}% neg)`;
}

// Generate AI-style summary
function generateSummary(stockData, newsData) {
  const sentiment = calculateOverallSentiment(newsData);
  const sentimentWord = sentiment.includes("Positive")
    ? "positive"
    : sentiment.includes("Negative")
    ? "negative"
    : "mixed";

  return (
    `${stockData.name} (${
      stockData.symbol || "N/A"
    }) is showing ${sentimentWord} market sentiment based on recent news analysis. ` +
    `The company operates in the ${stockData.sector || "Unknown"} sector ` +
    `${
      stockData.industry
        ? `focusing on ${stockData.industry.toLowerCase()}`
        : ""
    }. ` +
    `Current analysis suggests ${sentiment.toLowerCase()} investor outlook. ` +
    `This assessment is based on ${newsData.length} recent news articles and market data.`
  );
}
