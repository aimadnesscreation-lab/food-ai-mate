import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const makeApiCall = async (prompt: string, attempt = 1): Promise<Response> => {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a nutritional analysis AI. Parse food descriptions and return nutritional data in JSON format.

Return ONLY a JSON array of food items with this exact structure:
[
  {
    "food_name": "descriptive name with quantity",
    "calories": number,
    "carbs": number,
    "protein": number,
    "fat": number,
    "quantity": "serving size description",
    "vitamin_a": number (mcg RAE),
    "vitamin_c": number (mg),
    "vitamin_d": number (mcg),
    "calcium": number (mg),
    "iron": number (mg),
    "fiber": number (g)
  }
]

Rules:
- Use standard nutritional values per serving
- If quantity not specified, assume standard serving
- Return multiple items if multiple foods mentioned
- Be accurate with nutritional and micronutrient values
- Include the quantity in food_name (e.g., "Roti (2 rotis)", "Egg omelette (2 eggs)")
- Provide micronutrient values based on standard food databases

Example input: "I ate 2 rotis and an omelette with 2 eggs"
Example output: [{"food_name":"Roti (2 rotis)","calories":240,"carbs":40,"protein":6,"fat":2,"quantity":"2 rotis","vitamin_a":0,"vitamin_c":0,"vitamin_d":0,"calcium":20,"iron":2.4,"fiber":4},{"food_name":"Egg omelette (2 eggs)","calories":180,"carbs":2,"protein":12,"fat":14,"quantity":"2 eggs","vitamin_a":260,"vitamin_c":0,"vitamin_d":2,"calcium":56,"iron":1.8,"fiber":0}]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error (attempt ${attempt}):`, response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 503) {
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Service overloaded, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeApiCall(prompt, attempt + 1);
        }
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again in a moment.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    return response;
  };

  try {
    const { prompt } = await req.json();
    console.log('Parsing food input:', prompt);

    const response = await makeApiCall(prompt);

    if (!response.ok) {
      // Propagate the error response (e.g., 429/503) to the client
      return response;
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    console.log('AI response:', content);
    
    // Parse the JSON response
    let foodItems;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      foodItems = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse nutrition data from AI');
    }

    return new Response(
      JSON.stringify({ foodItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-food function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});