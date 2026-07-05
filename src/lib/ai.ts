export interface AIResponse {
  intent: "TRACK_PRODUCT" | "PRICE_ADVICE" | "GENERAL_HELP";
  productUrl: string | null;
  targetPrice: number | null;
  summary: string;
  recommendation: string;
  nextAction: string;
}

export async function analyzeShoppingRequest(
  message: string,
  userContext?: {
    trackers?: Array<{
      product: { title: string; currentPrice: number | null; store: string | null; url: string };
      targetPrice: number;
    }>;
  }
): Promise<AIResponse> {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (apiKey) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are Pricelytix AI, an intelligent e-commerce shopping and price tracking assistant.
Analyze the user's message and current portfolio context (if provided) and return a strict JSON object.

JSON Schema:
{
  "intent": "TRACK_PRODUCT" | "PRICE_ADVICE" | "GENERAL_HELP",
  "productUrl": string | null (extracted Amazon/Flipkart URL if they want to track),
  "targetPrice": number | null (extracted target price number),
  "summary": "string (brief summary of analysis)",
  "recommendation": "string (buy/wait or configuration guidance)",
  "nextAction": "string (actionable next step for the user)"
}

Do not include any markdown formatting or extra text outside the JSON structure. Return raw JSON.`,
            },
            {
              role: "user",
              content: `User query: "${message}"\n\nUser Context:\n${JSON.stringify(userContext || {})}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.choices?.[0]?.message?.content;
        if (jsonText) {
          const parsed = JSON.parse(jsonText) as AIResponse;
          // Clean inputs
          return {
            intent: parsed.intent || "GENERAL_HELP",
            productUrl: parsed.productUrl || null,
            targetPrice: parsed.targetPrice ? Number(parsed.targetPrice) : null,
            summary: parsed.summary || "",
            recommendation: parsed.recommendation || "",
            nextAction: parsed.nextAction || "",
          };
        }
      }
      console.warn("[AI Assistant] Real AI API request failed or returned empty. Using fallback parser.");
    } catch (error) {
      console.error("[AI Assistant Error] Failed to call AI endpoint:", error);
    }
  }

  // Fallback Rule-Based Parser
  return runFallbackParser(message, userContext);
}

function runFallbackParser(
  message: string,
  userContext?: {
    trackers?: Array<{
      product: { title: string; currentPrice: number | null; store: string | null; url: string };
      targetPrice: number;
    }>;
  }
): AIResponse {
  const lowercaseMsg = message.toLowerCase();

  // 1. Detect Product URL
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urlMatch = message.match(urlRegex);
  const productUrl = urlMatch ? urlMatch[0] : null;

  // 2. Strip URL and extract Target Price
  const messageWithoutUrl = message.replace(urlRegex, "");
  const priceRegex = /(?:below|under|target|at|₹|rs|rs\.|\$)\s*(\d+(?:\.\d+)?)/i;
  let targetPrice: number | null = null;
  const priceMatch = messageWithoutUrl.match(priceRegex);

  if (priceMatch) {
    targetPrice = parseFloat(priceMatch[1]);
  } else {
    // Fallback: look for any standalone number in the text
    const anyNumberMatch = messageWithoutUrl.match(/\b\d{2,7}\b/);
    if (anyNumberMatch) {
      targetPrice = parseFloat(anyNumberMatch[0]);
    }
  }

  // 3. Determine Intent
  let intent: "TRACK_PRODUCT" | "PRICE_ADVICE" | "GENERAL_HELP" = "GENERAL_HELP";

  if (
    lowercaseMsg.includes("buy") ||
    lowercaseMsg.includes("wait") ||
    lowercaseMsg.includes("should i") ||
    lowercaseMsg.includes("advice") ||
    lowercaseMsg.includes("recommend") ||
    lowercaseMsg.includes("close to target") ||
    lowercaseMsg.includes("analyze")
  ) {
    intent = "PRICE_ADVICE";
  } else if (
    lowercaseMsg.includes("track") ||
    lowercaseMsg.includes("monitor") ||
    lowercaseMsg.includes("alert") ||
    lowercaseMsg.includes("add") ||
    productUrl
  ) {
    intent = "TRACK_PRODUCT";
  }

  // 4. Generate structured content based on intent
  let summary = "";
  let recommendation = "";
  let nextAction = "";

  if (intent === "TRACK_PRODUCT") {
    if (productUrl && targetPrice) {
      summary = `Natural language request to track a product detected at target price of ₹${targetPrice.toLocaleString()}.`;
      recommendation = `The system is ready to track this URL: ${productUrl.substring(0, 45)}... with a target alert at ₹${targetPrice.toLocaleString()}.`;
      nextAction = `Go to the "Add Product" tab and input the details, or confirm this tracking request.`;
    } else if (productUrl) {
      summary = "Product link identified, but no target price was specified.";
      recommendation = "To set up an alert, please provide a target price (e.g., 'Track this if it drops below 15000').";
      nextAction = "Enter the target price alongside the product URL.";
    } else if (targetPrice) {
      summary = `Target price of ₹${targetPrice.toLocaleString()} detected, but no store URL was found.`;
      recommendation = "Please supply a valid Amazon India or Flipkart product link.";
      nextAction = "Paste the product link into the chat along with your target price.";
    } else {
      summary = "Request to track a product detected, but no URL or price was parsed.";
      recommendation = "Provide both a valid URL (Amazon/Flipkart) and your desired target price.";
      nextAction = "Try sending: 'Track this product if it goes below 1200: <URL>'";
    }
  } else if (intent === "PRICE_ADVICE") {
    const trackers = userContext?.trackers || [];
    if (trackers.length > 0) {
      const belowTarget = trackers.filter(
        (t) => t.product.currentPrice !== null && t.product.currentPrice <= t.targetPrice
      );
      const aboveTarget = trackers.filter(
        (t) => t.product.currentPrice !== null && t.product.currentPrice > t.targetPrice
      );

      summary = `Analyzing your portfolio of ${trackers.length} tracker(s). Currently, ${belowTarget.length} product(s) are below target and ${aboveTarget.length} are above target.`;
      
      if (belowTarget.length > 0) {
        recommendation = `BUY ALERT: "${belowTarget[0].product.title.substring(0, 40)}..." is at ₹${belowTarget[0].product.currentPrice?.toLocaleString()}, which is below your target of ₹${belowTarget[0].targetPrice.toLocaleString()}.`;
        nextAction = "Check your notifications and buy the item on the store website.";
      } else {
        recommendation = "No products have met their target price thresholds yet. We recommend waiting for a price drop.";
        nextAction = "Click 'Refresh All Prices' on your dashboard to fetch the latest values.";
      }
    } else {
      summary = "You do not have any active product trackers to analyze.";
      recommendation = "Create a product tracker to receive real-time price warnings and purchase advice.";
      nextAction = "Navigate to 'Add Product' page to track your first item.";
    }
  } else {
    summary = "Pricelytix AI assistant ready.";
    recommendation = "I can analyze your portfolio, recommend whether to buy/wait, or extract links to create trackers.";
    nextAction = "Try asking: 'Should I buy my products now?' or 'Track this product: <URL> for 5000'";
  }

  return {
    intent,
    productUrl,
    targetPrice,
    summary,
    recommendation,
    nextAction,
  };
}
