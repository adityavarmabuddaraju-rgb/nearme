import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Built-in rule-based NLP fallback engine
const parseQueryWithNLP = (prompt) => {
  const p = prompt.toLowerCase();
  
  // Extract radius if mentioned (e.g. "within 3 km", "in 5km", "within 2000 meters")
  let radius = 5000;
  const kmMatch = p.match(/(\d+(?:\.\d+)?)\s*(?:km|kms|kilometer|kilometers)/i);
  const mMatch = p.match(/(\d+)\s*(?:m|meter|meters)/i);
  
  if (kmMatch) {
    const val = parseFloat(kmMatch[1]);
    radius = Math.min(Math.max(Math.round(val * 1000), 500), 50000);
  } else if (mMatch) {
    const val = parseInt(mMatch[1], 10);
    radius = Math.min(Math.max(val, 500), 50000);
  }

  // Detect category with plural and synonym support
  let category = '';
  if (/restaurant|restaurants|dinner|lunch|food|dine|eating/i.test(p)) {
    category = 'restaurant';
  } else if (/cafe|cafes|coffee|tea|espresso/i.test(p)) {
    category = 'cafe';
  } else if (/hospital|hospitals|doctor|emergency|clinic|clinics|medical/i.test(p)) {
    category = 'hospital';
  } else if (/pharmacy|pharmacies|chemist|chemists|medicine|drugstore/i.test(p)) {
    category = 'pharmacy';
  } else if (/police|cop|cops|precinct/i.test(p)) {
    category = 'police';
  } else if (/atm|atms|cash machine/i.test(p)) {
    category = 'atm';
  } else if (/bank|banks/i.test(p)) {
    category = 'bank';
  } else if (/hotel|hotels|motel|motels|resort|resorts|lodge|stay/i.test(p)) {
    category = 'hotel';
  } else if (/college|colleges|university|universities|campus/i.test(p)) {
    category = 'college';
  } else if (/school|schools/i.test(p)) {
    category = 'school';
  } else if (/petrol|fuel|gas station|diesel/i.test(p)) {
    category = 'fuel';
  } else if (/mall|malls|supermarket|supermarkets|shopping/i.test(p)) {
    category = 'mall';
  } else if (/bus stop|bus stops|bus station|bus stations/i.test(p)) {
    category = 'bus_station';
  } else if (/railway|train station|railway station/i.test(p)) {
    category = 'railway_station';
  } else if (/tourist|attraction|attractions|monument|monuments|museum|museums/i.test(p)) {
    category = 'tourist_attraction';
  }

  const openNow = /open now|currently open|24\/7|late night/i.test(p);
  const highlyRated = /high rating|highly rated|best|top rated|good/i.test(p);

  // Clean custom text query
  let cleanQuery = prompt
    .replace(/find|near me|nearby|show me|search for|around me|close to me|get me|looking for/gi, '')
    .replace(/within\s*\d+\s*(?:km|kms|m|meters|meter)?/gi, '')
    .replace(/in\s*\d+\s*(?:km|kms|m|meters|meter)?/gi, '')
    .replace(/open now|currently open|top rated|best/gi, '')
    .trim();

  return {
    category,
    radius,
    minRating: highlyRated ? 4 : 0,
    openNow,
    query: category ? '' : cleanQuery,
    preference: prompt.trim(),
  };
};

// 1. Convert natural language user prompt into structured search parameters
export const parseSearchQueryWithAI = async (prompt) => {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey === 'your_ai_api_key' || apiKey.trim() === '') {
    // Graceful fallback to regex/NLP
    return parseQueryWithNLP(prompt);
  }

  try {
    const systemPrompt = `
You are an expert location query parser for NearbyAI.
Convert the user's natural language search prompt into a clean JSON object with these exact keys:
- "category": Must be one of ["restaurant", "cafe", "hospital", "pharmacy", "police", "atm", "bank", "hotel", "college", "school", "fuel", "mall", "bus_station", "railway_station", "tourist_attraction"] or "" if none match.
- "radius": Integer in meters (minimum 1000, maximum 50000, default 5000).
- "minRating": Number (default 0, or 4 if words like 'best', 'top', 'great' are used).
- "openNow": Boolean (true if user specifies open now/late night).
- "query": String with any custom place name or specific keywords, or "" if standard category.
- "preference": String summarizing user context (e.g. "quiet place for studying", "emergency medical care").

Respond ONLY with valid JSON, without markdown backticks or commentary.
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(
      url,
      {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\nUser request: "${prompt}"` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
        httpsAgent,
      },
      { timeout: 8000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed = JSON.parse(text.replace(/```json\n?|```/g, '').trim());
      return {
        category: parsed.category || '',
        radius: Math.min(Math.max(parsed.radius || 5000, 1000), 50000),
        minRating: parsed.minRating || 0,
        openNow: Boolean(parsed.openNow),
        query: parsed.query || '',
        preference: parsed.preference || prompt,
      };
    }
  } catch (err) {
    console.warn('[AI Service] Gemini query parse failed or key invalid, falling back to NLP:', err.message);
  }

  return parseQueryWithNLP(prompt);
};

// 2. Rank and recommend places from real Overpass results based on user prompt
export const rankPlacesWithAI = async (userPrompt, places) => {
  if (!places || places.length === 0) {
    return {
      summary: 'No places found in OpenStreetMap within the selected radius.',
      recommendations: [],
    };
  }

  const apiKey = process.env.AI_API_KEY;

  // Fallback heuristic ranker if API key is not configured
  const generateRuleBasedRecommendations = () => {
    // Select top 3 closest places with the best tags
    const scoredPlaces = places.map((place) => {
      let score = 50000 - place.distance; // closer is higher score
      if (place.openingHours) score += 500;
      if (place.phone) score += 300;
      if (place.website) score += 200;
      if (place.cuisine) score += 300;
      return { ...place, score };
    });

    scoredPlaces.sort((a, b) => b.score - a.score);
    const topPicks = scoredPlaces.slice(0, 4).map((p) => ({
      placeId: p.id,
      name: p.name,
      category: p.category,
      distanceText: p.distanceText,
      reason: `Located ${p.distanceText} away with verified OpenStreetMap details${p.cuisine ? ` (${p.cuisine} cuisine)` : ''}${p.openingHours ? ` and operating hours: ${p.openingHours}` : ''}.`,
    }));

    return {
      summary: `Found ${places.length} verified places from OpenStreetMap. Here are the top recommendations matching "${userPrompt}":`,
      recommendations: topPicks,
    };
  };

  if (!apiKey || apiKey === 'your_ai_api_key' || apiKey.trim() === '') {
    return generateRuleBasedRecommendations();
  }

  try {
    // Prepare lightweight summaries of the real places so context is token-efficient
    const placesContext = places.slice(0, 15).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      distance: p.distanceText,
      address: p.address,
      cuisine: p.cuisine,
      openingHours: p.openingHours,
      tags: p.tags?.amenity || p.tags?.shop || '',
    }));

    const systemPrompt = `
You are NearbyAI Recommendation Engine.
The user asked: "${userPrompt}".
Here is a list of REAL OpenStreetMap places retrieved near the user:
${JSON.stringify(placesContext, null, 2)}

CRITICAL INSTRUCTIONS:
1. You MUST NOT invent any new places. Only recommend items from the provided list by their exact id and name.
2. Select the 3 to 5 best options that match the user's intent.
3. For each recommendation, provide a brief, helpful reason explaining why it fits the request.
4. Provide a friendly conversational summary.

Return JSON in this format:
{
  "summary": "Friendly 1-2 sentence overview answering user query",
  "recommendations": [
    {
      "placeId": "exact id from list",
      "name": "exact name from list",
      "category": "category",
      "distanceText": "distance",
      "reason": "1 sentence explanation"
    }
  ]
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(
      url,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
        httpsAgent,
      },
      { timeout: 10000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return JSON.parse(text.replace(/```json\n?|```/g, '').trim());
    }
  } catch (err) {
    console.warn('[AI Service] Gemini ranking failed, falling back to rule-based ranking:', err.message);
  }

  return generateRuleBasedRecommendations();
};
