// ai.controller.js
exports.classifyCondition = async (req, res) => {
  try {
    const { description, category } = req.body;

    if (!description || !category) {
      return res.status(400).json({ status: 'error', message: 'Description and category are required' });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    
    // If no key is configured, fallback to a placeholder/mock response
    if (!openRouterKey || openRouterKey === 'placeholder_key') {
      console.log('No OpenRouter key found. Using mock AI response.');
      return res.status(200).json({
        status: 'success',
        data: {
          condition: 'Fair',
          confidence: 0.8,
          isMock: true
        }
      });
    }

    // Call OpenRouter API using native fetch
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.3-70b-instruct:free",
        "messages": [
          {
            "role": "system",
            "content": "You are an AI that classifies the condition of a donated item. Respond with exactly one word: 'Good', 'Fair', or 'Worn'. Do not add any punctuation or explanation."
          },
          {
            "role": "user",
            "content": `Category: ${category}\nDescription: ${description}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let condition = data.choices[0]?.message?.content?.trim() || 'Fair';

    // Validate the response
    if (!['Good', 'Fair', 'Worn'].includes(condition)) {
      condition = 'Fair'; // Fallback
    }

    res.status(200).json({
      status: 'success',
      data: {
        condition,
        isMock: false
      }
    });

  } catch (error) {
    console.error("AI Classification Error:", error);
    res.status(500).json({ status: 'error', message: 'Failed to classify condition' });
  }
};
/**
 * AI Demand Forecast for NGOs
 * @route POST /api/ai/ngo/forecast
 */
exports.getNGODemandForecast = async (req, res) => {
  try {
    const { supplyDemandData } = req.body;

    if (!supplyDemandData || !Array.isArray(supplyDemandData)) {
      return res.status(400).json({ status: 'error', message: 'Supply/Demand data is required' });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    
    // Format data for the prompt
    const dataSummary = supplyDemandData.map(d => `${d.category}: Supply=${d.supply}, Demand=${d.demand}`).join('\n');

    if (!openRouterKey || openRouterKey === 'placeholder_key') {
      return res.status(200).json({
        status: 'success',
        data: {
          forecast: "Based on current trends, we expect a critical shortage in 'Clothing' and 'Electronics' over the next 14 days. Demand is outpacing supply by 40% in urban clusters.",
          recommendations: [
            "Initiate a targeted Clothing drive in high-reputation donor zones.",
            "Adjust bulk request limits for Furniture to conserve logistics bandwidth.",
            "Notify local donors about the high demand for educational Books."
          ],
          isMock: true
        }
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemma-2-27b-it", // Using Gemma-2-27b as Gemma-3 is bleeding edge
        "messages": [
          {
            "role": "system",
            "content": "You are an expert humanitarian logistics analyst. Analyze the provided supply/demand data for a donation platform and provide a concise forecast (max 3 sentences) and 3 actionable recommendations. Format as JSON: { \"forecast\": \"...\", \"recommendations\": [\"...\", \"...\", \"...\"] }"
          },
          {
            "role": "user",
            "content": `Here is the current category-wise supply and demand data:\n${dataSummary}`
          }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) throw new Error(`AI API error: ${response.status}`);

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0]?.message?.content || "{}");

    res.status(200).json({
      status: 'success',
      data: {
        ...result,
        isMock: false
      }
    });

  } catch (error) {
    console.error("AI Forecast Error:", error);
    res.status(500).json({ status: 'error', message: 'Failed to generate AI forecast' });
  }
};
