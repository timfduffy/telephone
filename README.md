# 🎭 AI Telephone Game

A fun web application that demonstrates how AI models can "play telephone" - where text becomes an image, then that image is analyzed to guess the original prompt, and the cycle repeats 4 times.

## How It Works

1. **User Input**: Enter an initial text prompt
2. **Generate Image**: Runware AI creates an image from the text
3. **Analyze Image**: OpenRouter's Gemini model analyzes the image and guesses what prompt created it
4. **Repeat**: This process repeats 4 times, showing how the original meaning transforms

## Local Development

### Prerequisites

- Runware API key ([Get one here](https://runware.ai))
- OpenRouter API key ([Get one here](https://openrouter.ai))

### Setup

1. Open `index.html` in a web browser
2. Enter your API keys in the form fields
3. Enter an initial prompt and click "Start Telephone Game"

## Deployment on Cloudflare Pages

### Step 1: Environment Variables

Set up these environment variables in your Cloudflare Pages dashboard:

- `RUNWARE_API_KEY`: Your Runware API key
- `OPENROUTER_API_KEY`: Your OpenRouter API key

### Step 2: Deploy

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command to: (leave empty - this is a static site)
3. Set build output directory to: `/` (root)
4. Deploy!

### Environment Variable Configuration

When deployed, the app will:
- Use server-side functions for OpenRouter API calls (secure)
- Still require manual entry of Runware API key (client-side SDK limitation)
- Automatically detect deployment environment and adjust UI accordingly

## API Configuration

### Runware (Image Generation)
- **Model**: `runware:108@1` (Qwen image model)
- **Output**: 512x512 JPEG images
- **SDK**: Client-side WebSocket connection

### OpenRouter (Image Analysis)
- **Model**: `google/gemini-2.0-flash-exp`
- **Prompt**: Specialized prompt for guessing image generation prompts
- **API**: REST API with vision capabilities

## File Structure

```
├── index.html              # Main application
├── functions/
│   ├── api/
│   │   ├── config.js       # Environment detection
│   │   └── analyze-image.js # Server-side image analysis
└── README.md              # This file
```

## Features

- **Progressive Results**: See each step complete in real-time
- **Error Handling**: Graceful handling of API failures
- **Responsive Design**: Works on desktop and mobile
- **Environment Detection**: Automatically configures for local vs. deployed environments
- **Secure API Keys**: Server-side handling for OpenRouter API calls when deployed

## Troubleshooting

### Common Issues

1. **"Runware API key required"**: Enter your Runware API key in the form field
2. **"OpenRouter API key required"**: Either enter manually or ensure environment variable is set
3. **Connection errors**: Check your internet connection and API key validity
4. **CORS errors**: These should be resolved by the server-side functions in deployment

### Local Development vs. Deployment

- **Local**: Both API keys must be entered manually in the form
- **Deployed**: OpenRouter uses environment variables, Runware still requires manual entry

## License

MIT License - Feel free to modify and use for your own projects!
