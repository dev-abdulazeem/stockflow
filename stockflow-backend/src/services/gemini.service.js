const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Simple in-memory cache: userId -> { date, insights }
const insightsCache = new Map();

// Retry helper with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const isServerError = error.response?.status >= 500;
      
      if ((isRateLimit || isServerError) && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.log(`Retrying in ${Math.round(delay)}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

async function generateInsights(storeData, userId = 'default') {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${userId}-${today}`;

  // Return cached insights if available for today
  if (insightsCache.has(cacheKey)) {
    console.log('Returning cached AI insights for', cacheKey);
    return insightsCache.get(cacheKey);
  }

  try {
    const prompt = `
You are a business intelligence assistant for a small retail store called "${storeData.storeName}".
Analyze the following store data and provide actionable insights in a friendly, conversational tone.

STORE DATA:
- Date: ${storeData.date}
- Today's Revenue: ${storeData.currency}${storeData.todayRevenue}
- Yesterday's Revenue: ${storeData.currency}${storeData.yesterdayRevenue}
- Sales Change: ${storeData.salesChange}%
- Today's Profit: ${storeData.currency}${storeData.todayProfit}
- Profit Margin: ${storeData.profitMargin}%
- Total Products: ${storeData.totalProducts}
- Low Stock Items: ${storeData.lowStockCount}
- Top Selling Today: ${storeData.topProducts.map(p => `${p.name} (${p.quantity} sold)`).join(', ') || 'None'}
- Slow Products (no sales in 7+ days): ${storeData.slowProducts.map(p => p.name).join(', ') || 'None'}

Provide:
1. A brief daily summary (2-3 sentences)
2. 3-4 specific actionable recommendations
3. A motivational closing remark

Format as JSON:
{
  "summary": "string",
  "recommendations": ["string", "string", "string"],
  "closing": "string"
}

Keep it practical and specific to the data provided.
`;

    const response = await retryWithBackoff(() =>
      axios.post(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          model: 'meta-llama/llama-3.1-8b-instruct', // ✅ Fixed: removed :free suffix
          messages: [
            {
              role: 'system',
              content: 'You are a helpful business intelligence assistant. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://stockflow-ten-tau.vercel.app',
            'X-Title': 'StockFlow'
          }
        }
      )
    );

    const text = response.data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      
      // Cache for today
      insightsCache.set(cacheKey, insights);
      console.log('AI insights cached for', cacheKey);
      
      return insights;
    }
    
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    return generateFallbackInsights(storeData);
  }
}

function generateFallbackInsights(storeData) {
  const recommendations = [];
  
  if (storeData.salesChange > 20) {
    recommendations.push(`Sales are up ${storeData.salesChange}% from yesterday! Great momentum.`);
  } else if (storeData.salesChange < -20) {
    recommendations.push(`Sales dropped ${Math.abs(storeData.salesChange)}% from yesterday. Consider a promotion.`);
  }
  
  if (storeData.lowStockCount > 0) {
    recommendations.push(`Restock ${storeData.lowStockCount} product(s) soon to avoid stockouts.`);
  }
  
  if (storeData.topProducts.length > 0) {
    recommendations.push(`${storeData.topProducts[0].name} is your best seller. Consider increasing stock.`);
  }
  
  if (storeData.slowProducts.length > 0) {
    recommendations.push(`${storeData.slowProducts[0].name} hasn't sold in a while. Consider discounting it.`);
  }
  
  if (storeData.profitMargin < 20) {
    recommendations.push(`Your profit margin is ${storeData.profitMargin}%. Review your pricing strategy.`);
  }

  if (recommendations.length < 3) {
    recommendations.push('Track your best-selling items to optimize inventory.');
    recommendations.push('Consider offering bundle deals to increase average order value.');
  }

  let summary = `Today you made ${storeData.currency}${storeData.todayRevenue} in revenue`;
  if (storeData.salesChange > 0) {
    summary += `, up ${storeData.salesChange}% from yesterday`;
  } else if (storeData.salesChange < 0) {
    summary += `, down ${Math.abs(storeData.salesChange)}% from yesterday`;
  }
  summary += `. Your profit margin is ${storeData.profitMargin}%.`;

  return {
    summary,
    recommendations: recommendations.slice(0, 4),
    closing: 'Keep pushing! Every day is a chance to grow your business.'
  };
}

module.exports = { generateInsights };