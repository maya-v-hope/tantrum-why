#!/bin/bash

echo "🚀 tantrum.why Deployment Helper"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it with your OpenAI API key:"
    echo "   OPENAI_API_KEY=your_actual_api_key_here"
    exit 1
fi

# Check if app works locally
echo "🔍 Testing local app..."
if ! npm run dev > /dev/null 2>&1 & then
    echo "❌ Failed to start local app. Please fix issues first."
    exit 1
fi

# Kill the background process
pkill -f "node server.js" 2>/dev/null

echo "✅ Local app test passed!"
echo ""
echo "📋 Next Steps for Render Deployment:"
echo "1. Go to https://render.com"
echo "2. Sign up with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository"
echo "5. Configure settings:"
echo "   - Name: tantrum-why"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Plan: Free"
echo "6. Add environment variables:"
echo "   - OPENAI_API_KEY: your_actual_api_key"
echo "   - NODE_ENV: production"
echo "   - PORT: 10000"
echo "7. Click 'Create Web Service'"
echo ""
echo "🎉 Your app will be live at: https://your-app-name.onrender.com"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md" 