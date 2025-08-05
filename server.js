const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { getSystemPrompt } = require('./assistant-config');

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

// Explicitly serve the social preview image
app.get('/social-preview.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'social-preview.png'));
});

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // For now, return a simple response
        // You'll integrate with an actual LLM API here
        const response = await generateResponse(message);
        
        res.json({ response });
        
    } catch (error) {
        console.error('Error processing chat:', error);
        
        // Return a user-friendly error message
        res.json({ response: 'I\'m having trouble connecting right now. Please try again in a moment.' });
    }
});

// Real OpenAI response generation
async function generateResponse(userMessage) {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.');
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: getSystemPrompt()
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
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // Handle different types of errors gracefully
        if (error.code === 'insufficient_quota' || error.status === 429) {
            return 'I apologize, but I\'ve reached my usage limit for today. Please try again later or check your OpenAI account billing.';
        } else if (error.code === 'invalid_api_key') {
            return 'There was an issue with the API configuration. Please check your OpenAI API key.';
        } else {
            return 'I\'m having trouble connecting right now. Please try again in a moment.';
        }
    }
}

app.listen(PORT, () => {
    console.log(`🚀 CustomGPT Server running on http://localhost:${PORT}`);
    console.log(`🤖 OpenAI integration: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📝 Add your OpenAI API key to .env file to enable real AI responses`);
}); 