
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from '../_shared/supabase.ts';

const geminiApiKey = 'AIzaSyD95kv94Asj_EAo2-bguz01carr8PjCVOk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, startDate, endDate, numTravelers, budget, interests, additionalInfo } = await req.json();
    
    console.log('Request received:', { destination, startDate, endDate, numTravelers, budget, interests });
    
    // Get user info from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      throw new Error('Invalid user token');
    }

    console.log('User authenticated:', user.id);

    // Calculate trip duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Create detailed prompt for Gemini
    const prompt = `You are an expert travel planner. Create a detailed day-by-day itinerary for the following trip:

**Trip Details:**
- Destination: ${destination}
- Start Date: ${startDate}
- End Date: ${endDate}
- Duration: ${duration} days
- Number of travelers: ${numTravelers}
- Budget: ${budget}
- Interests: ${interests.join(', ')}
- Additional information: ${additionalInfo || 'None'}

**Requirements:**
Please provide a comprehensive itinerary that includes:

1. **Daily Schedule** (Day 1 to Day ${duration}):
   - Morning, afternoon, and evening activities
   - Specific attractions and their recommended visit times
   - Estimated time needed for each activity

2. **Dining Recommendations**:
   - Breakfast, lunch, and dinner suggestions for each day
   - Local specialties and must-try dishes
   - Restaurant recommendations with price ranges

3. **Transportation**:
   - How to get around the city/country
   - Transportation options between attractions
   - Estimated costs and travel times

4. **Accommodation Suggestions**:
   - Recommended areas to stay
   - Hotel/accommodation types within budget
   - Booking tips and considerations

5. **Cultural Highlights**:
   - Must-see attractions and landmarks
   - Cultural experiences and local customs
   - Historical significance of key sites

6. **Budget Breakdown**:
   - Estimated daily costs
   - Money-saving tips
   - Free or low-cost activities

7. **Practical Information**:
   - Best times to visit attractions
   - Weather considerations
   - Safety tips and local etiquette
   - Essential phrases (if applicable)

Format the response as a well-structured travel guide with clear headings and bullet points for easy reading.`;

    console.log('Calling Gemini API with gemini-2.0-flash model...');

    // Updated API call to use the correct endpoint and model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received successfully');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const generatedContent = data.candidates[0].content.parts[0].text;
    console.log('Generated content length:', generatedContent.length);

    // Save the itinerary to the database with user data
    const { data: itinerary, error: dbError } = await supabase
      .from('itineraries')
      .insert({
        user_id: user.id,
        destination,
        start_date: startDate,
        end_date: endDate,
        num_travelers: parseInt(numTravelers),
        budget,
        interests,
        additional_info: additionalInfo,
        content: {
          generated_text: generatedContent,
          generated_at: new Date().toISOString(),
          prompt_used: prompt,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || user.email
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Itinerary saved successfully with ID:', itinerary.id);

    return new Response(JSON.stringify({
      success: true,
      itinerary: {
        id: itinerary.id,
        content: generatedContent,
        destination: itinerary.destination,
        start_date: itinerary.start_date,
        end_date: itinerary.end_date,
        num_travelers: itinerary.num_travelers,
        budget: itinerary.budget,
        interests: itinerary.interests,
        created_at: itinerary.created_at,
        user_data: {
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || user.email
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-itinerary function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
