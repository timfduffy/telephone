// Cloudflare Pages Function to handle Runware API calls server-side
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
    const { prompt, imageParams } = await request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Use environment variable for Runware API key
    const runwareKey = env.RUNWARE_API_KEY;
    if (!runwareKey) {
      return new Response(JSON.stringify({ error: 'Runware API key not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Generate UUID v4 for the task
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Use provided imageParams or create default
    const defaultParams = {
      taskType: "imageInference",
      taskUUID: generateUUID(),
      model: "runware:97@3", // Default to HiDream
      positivePrompt: prompt,
      height: 512,
      width: 512,
      numberResults: 1,
      outputType: ["URL"],
      outputFormat: "WEBP",
      CFGScale: 2.5,
      steps: 16, // Default steps for HiDream
      scheduler: "Default",
      includeCost: true,
      outputQuality: 85
    };

    const finalParams = imageParams || defaultParams;
    if (!finalParams.taskUUID) {
      finalParams.taskUUID = generateUUID();
    }

    // Try to call Runware API
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${runwareKey}`
      },
      body: JSON.stringify([finalParams])
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Runware API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    // Response format: { "data": [{ "taskType": "imageInference", "imageURL": "...", ... }] }
    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      const result = data.data[0];
      let imageUrl = null;
      
      if (result.imageURL) {
        imageUrl = result.imageURL;
      } else if (result.imageDataURI) {
        imageUrl = result.imageDataURI;
      } else if (result.imageBase64Data) {
        imageUrl = `data:image/jpeg;base64,${result.imageBase64Data}`;
      }
      
      if (imageUrl) {
        return new Response(JSON.stringify({ 
          imageUrl: imageUrl 
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } else {
        throw new Error('No image URL found in response');
      }
    } else {
      throw new Error('Invalid response format from Runware API');
    }

  } catch (error) {
    console.error('Image generation failed:', error);
    return new Response(JSON.stringify({ 
      error: `Image generation failed: ${error.message}` 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
