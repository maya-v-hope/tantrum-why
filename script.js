// DOM elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const sendButton = document.getElementById('send-button');

// Conversation history for context
let conversationHistory = [];

// Follow-up quick reply options with variety
const followUpReplies = [
    // Positive responses
    [
        { text: "Brilliant!", message: "That's really helpful, thank you!" },
        { text: "Perfect!", message: "Perfect, that makes sense" },
        { text: "That's great!", message: "That's exactly what I needed" },
        { text: "Love this!", message: "I love this approach" }
    ],
    // Request for more help
    [
        { text: "Give me another tip like this", message: "Can you give me another tip like this?" },
        { text: "What else can I try?", message: "What else can I try?" },
        { text: "More ideas please", message: "Do you have more ideas for this situation?" },
        { text: "Any other approaches?", message: "Are there any other approaches I could try?" }
    ],
    // Didn't work responses
    [
        { text: "That didn't work at all", message: "That didn't work at all" },
        { text: "Tried it, no luck", message: "I tried that but it didn't work" },
        { text: "Not working for us", message: "That's not working for us" },
        { text: "Didn't help", message: "That didn't help in our situation" }
    ]
];

let followUpCounter = 0; // To add variety in follow-up selection

// Function to detect if AI response is asking questions (should suppress follow-up chips)
function isAskingQuestions(response) {
    // Convert to lowercase for case-insensitive matching
    const lowerResponse = response.toLowerCase();
    
    // Check for question patterns
    const questionPatterns = [
        /what happened when/,
        /how did.*respond/,
        /what.*feel.*about/,
        /can you tell me/,
        /what.*try/,
        /how.*go/,
        /what.*different/,
        /let.*know.*what/,
        /tell me more about/,
        /what.*specific/,
        /how.*child.*react/,
        /what.*challenging/,
        /describe.*situation/
    ];
    
    // Check if response contains question marks and question patterns
    const hasQuestionMarks = (response.match(/\?/g) || []).length >= 1;
    const hasQuestionPatterns = questionPatterns.some(pattern => pattern.test(lowerResponse));
    
    // Suppress follow-ups if it's clearly asking for more information
    return hasQuestionMarks && hasQuestionPatterns;
}

// Function to create follow-up quick replies
function addFollowUpReplies(aiResponse = '') {
    // Remove any existing follow-up replies
    const existingFollowUps = document.querySelector('.follow-up-replies');
    if (existingFollowUps) {
        existingFollowUps.remove();
    }
    
    // Don't add follow-up chips if AI is asking questions for more information
    if (isAskingQuestions(aiResponse)) {
        // Track when follow-ups are suppressed due to questions
        if (typeof gtag !== 'undefined') {
            gtag('event', 'followup_suppressed', {
                'event_category': 'engagement',
                'event_label': 'question_detected',
                'value': 1
            });
        }
        return;
    }
    
    // Create follow-up replies container
    const followUpContainer = document.createElement('div');
    followUpContainer.className = 'follow-up-replies';
    followUpContainer.innerHTML = `
        <div class="follow-up-buttons">
            ${getRandomFollowUpSet().map(reply => `
                <button type="button" class="follow-up-btn" data-message="${reply.message}" aria-label="Quick reply: ${reply.text}">
                    ${reply.text}
                </button>
            `).join('')}
        </div>
    `;
    
    // Add to chat messages area
    chatMessages.appendChild(followUpContainer);
    
    // Add event listeners to new buttons
    const followUpButtons = followUpContainer.querySelectorAll('.follow-up-btn');
    followUpButtons.forEach(button => {
        button.addEventListener('click', handleFollowUpClick);
        
        // Add keyboard support
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Scroll to show the new buttons
    followUpContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Function to get a random set of follow-up replies (one from each category)
function getRandomFollowUpSet() {
    followUpCounter++;
    const selectedReplies = [];
    
    // Pick one option from each category, using counter for variety
    followUpReplies.forEach((category, categoryIndex) => {
        const optionIndex = (followUpCounter + categoryIndex) % category.length;
        selectedReplies.push(category[optionIndex]);
    });
    
    return selectedReplies;
}

// Handle follow-up button clicks
async function handleFollowUpClick() {
    const message = this.dataset.message;
    
    // Track follow-up button usage
    if (typeof gtag !== 'undefined') {
        gtag('event', 'followup_reply_used', {
            'event_category': 'engagement',
            'event_label': message,
            'value': 1
        });
    }
    
    // Add activated state and disable buttons
    this.classList.add('activated');
    const allFollowUpButtons = document.querySelectorAll('.follow-up-btn');
    allFollowUpButtons.forEach(btn => btn.disabled = true);
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get AI response
        const response = await getAIResponse(message);
        
        // Remove typing indicator and add bot response
        removeTypingIndicator();
        addMessage(response, 'bot');
        
        // Track successful AI response from follow-up
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ai_response_received', {
                'event_category': 'engagement',
                'event_label': 'followup_interaction',
                'value': 1
            });
        }
        
        // Add to conversation history
        conversationHistory.push({ role: 'user', content: message });
        conversationHistory.push({ role: 'assistant', content: response });
        
        // Remove the follow-up buttons that were just used
        const followUpContainer = document.querySelector('.follow-up-replies');
        if (followUpContainer) {
            followUpContainer.remove();
        }
        
        // Add new follow-up replies for the new response
        setTimeout(() => addFollowUpReplies(response), 500);
        
    } catch (error) {
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        console.error('Error:', error);
        
        // Re-enable buttons on error
        allFollowUpButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('activated');
        });
    }
}

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
    
    // Track typed message submission
    if (typeof gtag !== 'undefined') {
        gtag('event', 'message_sent', {
            'event_category': 'engagement',
            'event_label': 'typed_message',
            'value': 1
        });
    }
    
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
        
        // Track successful AI response
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ai_response_received', {
                'event_category': 'engagement',
                'event_label': 'successful_interaction',
                'value': 1
            });
        }
        
        // Add both user message and bot response to conversation history
        conversationHistory.push({ role: 'user', content: message });
        conversationHistory.push({ role: 'assistant', content: response });
        
        // Add follow-up quick replies after a short delay
        setTimeout(() => addFollowUpReplies(response), 500);
        
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
            
            // Track quick reply button usage
            if (typeof gtag !== 'undefined') {
                gtag('event', 'quick_reply_used', {
                    'event_category': 'engagement',
                    'event_label': message,
                    'value': 1
                });
            }
            
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
                
                // Track successful AI response from quick reply
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'ai_response_received', {
                        'event_category': 'engagement',
                        'event_label': 'quick_reply_interaction',
                        'value': 1
                    });
                }
                
                // Add both user message and bot response to conversation history
                conversationHistory.push({ role: 'user', content: message });
                conversationHistory.push({ role: 'assistant', content: response });
                
                // Hide initial quick replies after first interaction
                if (quickReplies) {
                    quickReplies.style.display = 'none';
                }
                
                // Add follow-up quick replies after a short delay
                setTimeout(() => addFollowUpReplies(response), 500);
                
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