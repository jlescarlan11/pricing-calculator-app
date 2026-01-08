import { fetchWithBackoff } from "./utils.ts";
import { AnalyzePricingRequest, GeminiResponse } from "./types.ts";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Calls the Gemini API to analyze pricing data.
 */
export async function analyzeWithGemini(
  data: AnalyzePricingRequest,
  apiKey: string
): Promise<GeminiResponse> {
  const { input, results } = data;
  const total = results.totalCost || 1; // Avoid division by zero

  const ingredientsPct = ((results.breakdown.ingredients / total) * 100).toFixed(1);
  const laborPct = ((results.breakdown.labor / total) * 100).toFixed(1);
  const overheadPct = ((results.breakdown.overhead / total) * 100).toFixed(1);

  const prompt = `
    As a pricing expert for small food businesses, analyze this product data and provide exactly 3 concise, actionable recommendations (max 20 words each) to improve profit margins or optimize costs.

    Product Name: ${input.productName}
    Batch Size: ${input.batchSize}
    Total Cost per Unit: ₱${results.costPerUnit.toFixed(2)}
    Recommended Selling Price: ₱${results.recommendedPrice.toFixed(2)}
    Current Selling Price: ${input.currentSellingPrice ? `₱${input.currentSellingPrice.toFixed(2)}` : "Not set"}
    Target Profit Margin: ${results.profitMarginPercent}%

    Cost Breakdown (Total Batch: ₱${results.totalCost.toFixed(2)}):
    - Ingredients: ₱${results.breakdown.ingredients.toFixed(2)} (${ingredientsPct}%)
    - Labor: ₱${results.breakdown.labor.toFixed(2)} (${laborPct}%)
    - Overhead: ₱${results.breakdown.overhead.toFixed(2)} (${overheadPct}%)

    Focus on identifying high-cost areas or pricing opportunities based on the breakdown.
    Return your response as a raw JSON array of strings. Do not include markdown formatting like \`\`\`json.
  `;

  const response = await fetchWithBackoff(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Gemini API failed with status ${response.status}`);
  }

  const result = await response.json();
  
  try {
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }
    
    // Some models might still return markdown-wrapped JSON even if asked not to
    const cleanText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const recommendations = JSON.parse(cleanText);

    if (!Array.isArray(recommendations)) {
      throw new Error("Gemini response is not an array");
    }

    return { recommendations: recommendations.slice(0, 3) };
  } catch (err) {
    console.error("Failed to parse Gemini response:", err);
    throw new Error("Invalid response format from AI");
  }
}
