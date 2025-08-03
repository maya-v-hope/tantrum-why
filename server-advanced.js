const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, provider = 'openai' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let response;
        
        switch (provider) {
            case 'openai':
                response = await generateOpenAIResponse(message);
                break;
            case 'anthropic':
                response = await generateAnthropicResponse(message);
                break;
            case 'gemini':
                response = await generateGeminiResponse(message);
                break;
            default:
                response = await generateDemoResponse(message);
        }
        
        res.json({ response });
        
    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// OpenAI Integration
async function generateOpenAIResponse(userMessage) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a helpful AI assistant. Provide clear, concise, and helpful responses."
            },
            {
                role: "user",
                content: userMessage
            }
        ],
        max_tokens: 500,
        temperature: 0.7,
    });
    
    return completion.choices[0].message.content;
}

// Anthropic Integration
async function generateAnthropicResponse(userMessage) {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured');
    }

    // You'll need to install the Anthropic SDK: npm install @anthropic-ai/sdk
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 500,
        messages: [
            {
                role: "user",
                content: userMessage
            }
        ],
    });
    
    return message.content[0].text;
}

// Google Gemini Integration
async function generateGeminiResponse(userMessage) {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error('Google API key not configured');
    }

    // You'll need to install the Google AI SDK: npm install @google/generative-ai
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    
    return response.text();
}

// Demo response (fallback)
async function generateDemoResponse(userMessage) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = [
        "That's an interesting question! Let me think about that...",
        "I understand what you're asking. Here's what I can tell you...",
        "Great question! Based on what I know...",
        "I'd be happy to help with that. Here's my perspective...",
        "That's a thoughtful inquiry. Let me share some insights..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           " (Note: This is a demo response. Configure an LLM API key to get real responses.)";
}

app.listen(PORT, () => {
    console.log(`🚀 Advanced server running on http://localhost:${PORT}`);
    console.log(`📝 Available LLM providers:`);
    console.log(`   - OpenAI (GPT-3.5/4): Set OPENAI_API_KEY`);
    console.log(`   - Anthropic (Claude): Set ANTHROPIC_API_KEY`);
    console.log(`   - Google (Gemini): Set GOOGLE_API_KEY`);
    console.log(`📖 See README.md for setup instructions`);
}); 