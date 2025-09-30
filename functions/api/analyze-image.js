// Cloudflare Pages Function to handle OpenRouter API calls server-side
export async function onRequest({ request, env }) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'Image URL is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Use environment variable for OpenRouter API key
    const openrouterKey = env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-telephone-game.pages.dev',
        'X-Title': 'AI Telephone Game'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'This image was created by an AI image generator. Give your best guess at the prompt used. Include no other text, your only output should be your guess about the prompt that generated the image.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return new Response(JSON.stringify({ 
        analyzedPrompt: data.choices[0].message.content.trim() 
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      throw new Error('No response from OpenRouter API');
    }

  } catch (error) {
    console.error('Image analysis failed:', error);
    return new Response(JSON.stringify({ 
      error: `Image analysis failed: ${error.message}` 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
