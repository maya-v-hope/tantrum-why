# Customizing Your Assistant's Personality

## Quick Start: Use Your CustomGPT Prompt

### Step 1: Get Your CustomGPT Prompt
1. Go to your CustomGPT in ChatGPT
2. Click "Configure" (top right)
3. Copy the entire "Instructions" or "System Prompt"
4. This is your assistant's personality!

### Step 2: Update the Configuration
1. Open `assistant-config.js`
2. Find the `custom` section
3. Replace `PASTE YOUR CUSTOMGPT PROMPT HERE` with your actual prompt
4. Change `activeAssistant = 'basic'` to `activeAssistant = 'custom'`
5. Save the file

### Step 3: Test Your Assistant
1. The server will automatically restart
2. Open `http://localhost:3000`
3. Start chatting with your customized assistant!

## Example Customizations

### Coding Mentor
```javascript
activeAssistant = 'codingMentor';
```

### Writing Coach
```javascript
activeAssistant = 'writingCoach';
```

### Business Consultant
```javascript
activeAssistant = 'businessConsultant';
```

## Advanced Customization

### Multiple Personalities
You can create multiple assistant personalities:

1. **Add a new personality** in `assistant-config.js`:
```javascript
myCustomAssistant: `Your CustomGPT prompt here...`
```

2. **Activate it** by changing:
```javascript
activeAssistant = 'myCustomAssistant';
```

### Dynamic Personality Switching
You can even switch personalities via API calls by modifying the server code.

## Tips for Great Prompts

1. **Be specific** about the assistant's role and expertise
2. **Include examples** of how to respond
3. **Set tone and style** (formal, casual, encouraging, etc.)
4. **Define boundaries** (what topics to avoid)
5. **Include formatting preferences** (bullet points, code blocks, etc.)

## Troubleshooting

- **Assistant not responding correctly?** Check your prompt syntax
- **Server not restarting?** Save all files and check for errors
- **Prompt too long?** Break it into smaller sections
- **Need to test different prompts?** Use the `custom` section for quick testing

## Your CustomGPT Prompt Structure

Most CustomGPT prompts follow this pattern:
```
You are [ROLE] who [EXPERTISE].
Your goal is to [OBJECTIVE].

When responding:
- [BEHAVIOR 1]
- [BEHAVIOR 2]
- [BEHAVIOR 3]

[SPECIFIC INSTRUCTIONS OR EXAMPLES]
```

Copy this structure and replace with your CustomGPT content! 