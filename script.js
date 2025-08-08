// DOM elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const sendButton = document.getElementById('send-button');

// Conversation history for context
let conversationHistory = [];

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Handle form submission
chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input and reset height
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get AI response with conversation context
        const response = await getAIResponse(message);
        
        // Remove typing indicator and add bot response
        removeTypingIndicator();
        addMessage(response, 'bot');
        
        // Add both user message and bot response to conversation history
        conversationHistory.push({ role: 'user', content: message });
        conversationHistory.push({ role: 'assistant', content: response });
        
    } catch (error) {
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        console.error('Error:', error);
    }
});

// Add message to chat
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const paragraph = document.createElement('p');
    
    // For bot messages, convert markdown formatting and line breaks
    if (sender === 'bot') {
        // Convert **text** to <strong>text</strong>
        let formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Convert \n to <br>
        formattedContent = formattedContent.replace(/\n/g, '<br>');
        paragraph.innerHTML = formattedContent;
    } else {
        // For user messages, keep as plain text
        paragraph.textContent = content;
    }
    
    messageContent.appendChild(paragraph);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator-container';
    typingDiv.id = 'typing-indicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingContent.appendChild(dot);
    }
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Call the backend API for AI response
async function getAIResponse(userMessage) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: userMessage,
                conversationHistory: conversationHistory
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        return data.response;
        
    } catch (error) {
        console.error('Error calling API:', error);
        throw error;
    }
}

// Handle Enter key (send on Enter, new line on Shift+Enter)
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

// Disable send button when input is empty
userInput.addEventListener('input', function() {
    sendButton.disabled = !this.value.trim();
});

// Focus input on page load
window.addEventListener('load', function() {
    userInput.focus();
});

// Quick Reply Buttons Functionality
document.addEventListener('DOMContentLoaded', function() {
    const quickReplies = document.getElementById('quick-replies');
    const quickReplyButtons = document.querySelectorAll('.quick-reply-btn');
    
    // Add click event listeners to all quick reply buttons
    quickReplyButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const message = this.dataset.message;
            
            // Add activated state
            this.classList.add('activated');
            
            // Disable all quick reply buttons to prevent multiple clicks
            quickReplyButtons.forEach(btn => btn.disabled = true);
            
            // Inject message into input and trigger submission
            userInput.value = message;
            
            // Add user message to chat
            addMessage(message, 'user');
            
            // Clear input
            userInput.value = '';
            userInput.style.height = 'auto';
            
            // Show typing indicator
            showTypingIndicator();
            
            try {
                // Get AI response with conversation context
                const response = await getAIResponse(message);
                
                // Remove typing indicator and add bot response
                removeTypingIndicator();
                addMessage(response, 'bot');
                
                // Add both user message and bot response to conversation history
                conversationHistory.push({ role: 'user', content: message });
                conversationHistory.push({ role: 'assistant', content: response });
                
                // Hide quick replies after first interaction
                if (quickReplies) {
                    quickReplies.style.display = 'none';
                }
                
            } catch (error) {
                removeTypingIndicator();
                addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                console.error('Error:', error);
                
                // Re-enable buttons on error
                quickReplyButtons.forEach(btn => {
                    btn.disabled = false;
                    btn.classList.remove('activated');
                });
            }
        });
        
        // Add keyboard support for accessibility
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}); 