class ChatSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.messages = JSON.parse(localStorage.getItem('messages') || '[]');
        this.currentConversation = null;
        this.init();
    }

    init() {
        this.loadConversations();
        this.setupEventListeners();
    }

    loadConversations() {
        // Group messages by conversation
        const conversations = {};
        
        this.messages.forEach(message => {
            const otherUserId = message.from_user_id === this.currentUser.id ? 
                message.to_user_id : message.from_user_id;
            const conversationId = [this.currentUser.id, otherUserId].sort().join('_');
            
            if (!conversations[conversationId]) {
                conversations[conversationId] = {
                    id: conversationId,
                    other_user_id: otherUserId,
                    other_user_name: message.from_user_id === this.currentUser.id ? 
                        message.to_user_name : message.from_user_name,
                    last_message: message.message,
                    last_message_time: message.sent_at,
                    unread: message.to_user_id === this.currentUser.id && !message.is_read
                };
            }
        });

        this.displayConversations(Object.values(conversations));
    }

    displayConversations(conversations) {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        if (conversations.length === 0) {
            conversationsList.innerHTML = '<p>No conversations yet</p>';
            return;
        }

        conversationsList.innerHTML = conversations.map(conv => `
            <div class="conversation-item" onclick="chatSystem.openConversation(${conv.other_user_id}, '${conv.other_user_name}')">
                <div class="avatar">${conv.other_user_name.charAt(0).toUpperCase()}</div>
                <div class="conversation-info">
                    <h4>${conv.other_user_name}</h4>
                    <p>${conv.last_message.substring(0, 50)}${conv.last_message.length > 50 ? '...' : ''}</p>
                </div>
                <div class="conversation-meta">
                    <span>${new Date(conv.last_message_time).toLocaleDateString()}</span>
                    ${conv.unread ? '<span class="unread-badge"></span>' : ''}
                </div>
            </div>
        `).join('');
    }

    openConversation(otherUserId, otherUserName) {
        this.currentConversation = otherUserId;
        
        // Update chat header
        document.getElementById('chatUserName').textContent = otherUserName;
        document.getElementById('chatUserAvatar').textContent = otherUserName.charAt(0).toUpperCase();
        document.getElementById('chatUserStatus').textContent = 'Online';
        
        // Show message input
        document.getElementById('messageInputArea').style.display = 'block';
        
        // Load messages
        this.loadMessages(otherUserId);
    }

    loadMessages(otherUserId) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const conversationMessages = this.messages.filter(msg => 
            (msg.from_user_id === this.currentUser.id && msg.to_user_id === otherUserId) ||
            (msg.from_user_id === otherUserId && msg.to_user_id === this.currentUser.id)
        ).sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));

        messagesContainer.innerHTML = conversationMessages.map(msg => `
            <div class="message ${msg.from_user_id === this.currentUser.id ? 'sent' : 'received'}">
                <div class="message-content">
                    <p>${msg.message}</p>
                    <span class="message-time">${new Date(msg.sent_at).toLocaleTimeString()}</span>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Mark messages as read
        this.markMessagesAsRead(otherUserId);
    }

    setupEventListeners() {
        const sendBtn = document.getElementById('sendMessageBtn');
        const messageInput = document.getElementById('messageText');

        if (sendBtn && messageInput) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageText');
        const message = messageInput.value.trim();

        if (!message || !this.currentConversation) {
            return;
        }

        const newMessage = {
            id: Date.now(),
            conversation_id: [this.currentUser.id, this.currentConversation].sort().join('_'),
            from_user_id: this.currentUser.id,
            from_user_name: this.currentUser.full_name,
            to_user_id: this.currentConversation,
            to_user_name: document.getElementById('chatUserName').textContent,
            message: message,
            is_read: false,
            sent_at: new Date().toISOString()
        };

        this.messages.push(newMessage);
        localStorage.setItem('messages', JSON.stringify(this.messages));

        // Clear input
        messageInput.value = '';

        // Reload messages
        this.loadMessages(this.currentConversation);
        this.loadConversations();
    }

    markMessagesAsRead(otherUserId) {
        this.messages.forEach(msg => {
            if (msg.from_user_id === otherUserId && msg.to_user_id === this.currentUser.id) {
                msg.is_read = true;
            }
        });
        localStorage.setItem('messages', JSON.stringify(this.messages));
        this.loadConversations();
    }

    searchConversations(query) {
        // Filter conversations based on search query
        const allConversations = this.messages.reduce((acc, msg) => {
            const otherUserId = msg.from_user_id === this.currentUser.id ? 
                msg.to_user_id : msg.from_user_id;
            const otherUserName = msg.from_user_id === this.currentUser.id ? 
                msg.to_user_name : msg.from_user_name;
            const conversationId = [this.currentUser.id, otherUserId].sort().join('_');
            
            if (!acc[conversationId]) {
                acc[conversationId] = {
                    id: conversationId,
                    other_user_id: otherUserId,
                    other_user_name: otherUserName,
                    last_message: msg.message,
                    last_message_time: msg.sent_at,
                    unread: msg.to_user_id === this.currentUser.id && !msg.is_read
                };
            }
            return acc;
        }, {});

        const filteredConversations = Object.values(allConversations).filter(conv =>
            conv.other_user_name.toLowerCase().includes(query.toLowerCase()) ||
            conv.last_message.toLowerCase().includes(query.toLowerCase())
        );

        this.displayConversations(filteredConversations);
    }
}

// Initialize chat system
document.addEventListener('DOMContentLoaded', () => {
    window.chatSystem = new ChatSystem();
    
    // Add search functionality
    const searchInput = document.getElementById('searchConversations');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            chatSystem.searchConversations(e.target.value);
        });
    }
});