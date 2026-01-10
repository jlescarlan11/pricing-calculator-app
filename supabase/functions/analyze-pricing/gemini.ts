import { fetchWithBackoff } from './utils.ts';
import { AnalyzePricingRequest, GeminiResponse } from './types.ts';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Calls the Gemini API to analyze pricing data.
 */
export async function analyzeWithGemini(
  data: AnalyzePricingRequest,
  apiKey: string
): Promise<GeminiResponse> {
  const { input, results, competitors = [] } = data;
  const total = results.totalCost || 1; // Avoid division by zero

  const ingredientsPct = ((results.breakdown.ingredients / total) * 100).toFixed(1);
  const laborPct = ((results.breakdown.labor / total) * 100).toFixed(1);
  const overheadPct = ((results.breakdown.overhead / total) * 100).toFixed(1);

  // --- Market Position Logic ---
  const hasEnoughCompetitors = competitors.length >= 2;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  // Check if ANY data is stale (older than 30 days or missing date)
  const hasStaleData = competitors.some((c) => {
    if (!c.updatedAt) return true; // Treat missing date as stale
    return new Date(c.updatedAt).getTime() < thirtyDaysAgo;
  });

  let marketSection = '';
  let strategyInstruction = '';

  if (hasEnoughCompetitors) {
    const competitorList = competitors
      .map((c) => `- ${c.competitorName}: ₱${c.competitorPrice.toFixed(2)}`)
      .join('\n');

    marketSection = `
    Market Position Data (Competitors):
    ${competitorList}
    `;

    if (hasStaleData) {
      marketSection +=
        '\n    IMPORTANT: Data Age Warning - Some market data is older than 30 days. Verify market relevance before recommending aggressive price changes.';
    }

    strategyInstruction =
      "Consider the product's market position relative to competitors (Budget, Mid-range, or Premium) when making recommendations.";
  } else {
    // Cost-Only Variant
    strategyInstruction =
      'Strictly focus on internal cost efficiency, waste reduction, and operational improvements. Do NOT reference market position or external pricing as insufficient competitor data is available.';
  }

  let variantsSection = '';
  if (results.variantResults && results.variantResults.length > 0) {
    const variantsList = results.variantResults
      .map(
        (v: VariantResult) =>
          `- ${v.name}: Cost ₱${v.costPerUnit.toFixed(2)}, Price ₱${v.recommendedPrice.toFixed(2)}, Margin ${v.profitMarginPercent.toFixed(1)}%`
      )
      .join('\n');

    variantsSection = `
    Variants Data (Selected for Analysis):
    ${variantsList}
    `;
    
    strategyInstruction += " For each of the selected variants, provide a specific suggested margin if it should differ from the base product. Identify any variants that are underperforming compared to others.";
  }

  const prompt = `
    As a pricing expert for small food businesses, analyze this product data and provide exactly 3 concise, actionable recommendations (max 20 words each) to improve profit margins or optimize costs.

    Product Name: ${input.productName}
    Batch Size: ${input.batchSize}
    Total Cost per Unit: ₱${results.costPerUnit.toFixed(2)}
    Recommended Selling Price: ₱${results.recommendedPrice.toFixed(2)}
    Current Selling Price: ${
      input.currentSellingPrice ? `₱${input.currentSellingPrice.toFixed(2)}` : 'Not set'
    }
    Target Profit Margin: ${results.profitMarginPercent}%

    Cost Breakdown (Total Batch: ₱${results.totalCost.toFixed(2)}):
    - Ingredients: ₱${results.breakdown.ingredients.toFixed(2)} (${ingredientsPct}%)
    - Labor: ₱${results.breakdown.labor.toFixed(2)} (${laborPct}%)
    - Overhead: ₱${results.breakdown.overhead.toFixed(2)} (${overheadPct}%)
    ${marketSection}
    ${variantsSection}

    Strategy: ${strategyInstruction}
    Focus on identifying high-cost areas or pricing opportunities based on the breakdown.
    Return your response as a raw JSON object with the following schema:
    {
      "recommendations": ["string", "string", "string"],
      "suggestedMarginValue": number,
      "variantRecommendations": [
        { "variantId": "string", "suggestedMarginValue": number }
      ]
    }
    The "suggestedMarginValue" should be your primary recommendation for the base product. 
    The "variantRecommendations" array should contain a suggested margin for EACH variant listed in the Variants Data above.
    Do not include markdown formatting like \`\`\`json.
  `;

  const response = await fetchWithBackoff(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini API Error:', errorBody);
    throw new Error(`Gemini API failed with status ${response.status}`);
  }

  const result = await response.json();

  try {
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    // Some models might still return markdown-wrapped JSON even if asked not to
    const cleanText = text
      .replace(/^```json\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
    const parsedData = JSON.parse(cleanText);

    if (!parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
      throw new Error('Gemini response missing recommendations array');
    }

    // Enforce numeric type for suggestedMarginValue, fallback to current margin if missing/invalid
    let suggestedMarginValue = results.profitMarginPercent;
    if (parsedData.suggestedMarginValue !== undefined) {
      const parsed = Number(parsedData.suggestedMarginValue);
      if (!isNaN(parsed)) {
        suggestedMarginValue = parsed;
      }
    }

    return {
      recommendations: parsedData.recommendations.slice(0, 3),
      suggestedMarginValue,
      variantRecommendations: parsedData.variantRecommendations || [],
    };
  } catch (err) {
    console.error('Failed to parse Gemini response:', err);
    throw new Error('Invalid response format from AI');
  }
}
