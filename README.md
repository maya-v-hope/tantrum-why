# CustomGPT Web App

A simple, modern web application that functions like a CustomGPT. Users can input questions and receive AI-powered responses through a beautiful chat interface.

## Features

- 🎨 **Modern UI**: Clean, responsive design that works on all devices
- 💬 **Real-time Chat**: Smooth chat interface with typing indicators
- 🚀 **Fast & Lightweight**: No data storage, instant responses
- 📱 **Mobile Friendly**: Responsive design for phones and tablets
- 🔧 **Easy to Customize**: Simple codebase ready for your modifications

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
tantrum-why/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Backend server
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Customizing the AI Responses

Currently, the app uses demo responses. To integrate with a real LLM API:

### Option 1: OpenAI (Recommended for beginners)

1. **Get an API key:**
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Create an API key in your dashboard

2. **Create a `.env` file:**
   ```bash
   OPENAI_API_KEY=your_api_key_here
   ```

3. **Update the server code:**
   - Open `server.js`
   - Uncomment the OpenAI code in the `generateResponse` function
   - Remove the demo response code

### Option 2: Other LLM Providers

You can integrate with other providers like:
- **Anthropic Claude**
- **Google Gemini**
- **Hugging Face**
- **Local models** (Ollama, etc.)

## Customizing the Assistant

### Change the System Prompt

In `server.js`, modify the system message to customize your assistant's personality:

```javascript
{
    role: "system",
    content: "You are a helpful AI assistant specialized in [your domain]. Provide clear, concise, and helpful responses."
}
```

### Modify the UI

- **Colors**: Edit the CSS variables in `styles.css`
- **Title**: Change the title in `index.html`
- **Welcome message**: Update the welcome message in `index.html`

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Deploy to the Web

You can deploy this app to various platforms:

- **Vercel**: Connect your GitHub repo
- **Netlify**: Drag and drop the folder
- **Railway**: Deploy with one click
- **Heroku**: Push to Heroku Git

## Security Notes

- ⚠️ **Never commit API keys** to version control
- 🔒 **Use environment variables** for sensitive data
- 🛡️ **Add rate limiting** for production use
- 🔐 **Consider authentication** for private assistants

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change the port in server.js
   const PORT = process.env.PORT || 3001;
   ```

2. **API key not working:**
   - Check your `.env` file exists
   - Verify the API key is correct
   - Ensure you have credits in your OpenAI account

3. **CORS errors:**
   - The server includes CORS middleware
   - If issues persist, check your browser console

## Next Steps

1. **Add authentication** for private assistants
2. **Implement conversation history** (optional)
3. **Add file upload** capabilities
4. **Integrate with databases** for persistent storage
5. **Add voice input/output** features
6. **Create multiple assistant personalities**

## Contributing

Feel free to fork this project and customize it for your needs!

## License

MIT License - feel free to use this code for your own projects. 