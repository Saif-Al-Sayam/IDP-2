class ChatSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.currentConversation = null;
        this.currentOtherUser = null;
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        this.loadConversations();
        this.setupEventListeners();
        this.loadQuickContacts();
    }

    async loadConversations() {
        try {
            const response = await fetch(`php/api.php?action=get_conversations&user_id=${this.currentUser.id}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayConversations(result.data);
            } else {
                console.error('Failed to load conversations:', result.message);
                this.displayConversations([]);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.displayConversations([]);
        }
    }

    displayConversations(conversations) {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        if (conversations.length === 0) {
            conversationsList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #718096;">No conversations yet. Start by messaging someone!</p>';
            return;
        }

        conversationsList.innerHTML = conversations.map(conv => `
            <div class="conversation-item" onclick="chatSystem.openConversation(${conv.other_user_id}, '${this.escapeHtml(conv.other_user_name)}')">
                <div class="avatar">${conv.other_user_name.charAt(0).toUpperCase()}</div>
                <div class="conversation-info">
                    <h4>${this.escapeHtml(conv.other_user_name)}</h4>
                    <p>${conv.last_message ? (this.escapeHtml(conv.last_message.substring(0, 50)) + (conv.last_message.length > 50 ? '...' : '')) : 'No messages yet'}</p>
                </div>
                <div class="conversation-meta">
                    <span>${conv.last_message_time ? new Date(conv.last_message_time).toLocaleDateString() : ''}</span>
                    ${conv.unread_count > 0 ? `<span class="unread-badge">${conv.unread_count}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    async openConversation(otherUserId, otherUserName) {
        this.currentConversation = otherUserId;
        this.currentOtherUser = otherUserName;
        
        document.getElementById('chatUserName').textContent = otherUserName;
        document.getElementById('chatUserAvatar').textContent = otherUserName.charAt(0).toUpperCase();
        document.getElementById('chatUserStatus').textContent = 'Online';
        
        document.getElementById('messageInputArea').style.display = 'block';
        
        await this.loadMessages(otherUserId);
    }

    async loadMessages(otherUserId) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        try {
            messagesContainer.innerHTML = '<div class="loading-state"><p>Loading messages...</p></div>';
            
            const response = await fetch(`php/api.php?action=get_messages&user_id=${this.currentUser.id}&other_user_id=${otherUserId}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayMessages(result.data);
            } else {
                messagesContainer.innerHTML = '<p>Error loading messages</p>';
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            messagesContainer.innerHTML = '<p>Error loading messages. Please try again.</p>';
        }
    }

    displayMessages(messages) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        if (messages.length === 0) {
            messagesContainer.innerHTML = '<div class="no-messages"><p>No messages yet. Start the conversation!</p></div>';
            return;
        }

        messagesContainer.innerHTML = messages.map(msg => `
            <div class="message ${msg.from_user_id == this.currentUser.id ? 'sent' : 'received'}">
                <div class="message-content">
                    <p>${this.escapeHtml(msg.message)}</p>
                    <span class="message-time">${new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
        `).join('');

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

    async sendMessage() {
        const messageInput = document.getElementById('messageText');
        const message = messageInput.value.trim();

        if (!message || !this.currentConversation) {
            alert('Please select a conversation and type a message');
            return;
        }

        try {
            const response = await fetch('php/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'send_message',
                    from_user_id: this.currentUser.id,
                    to_user_id: this.currentConversation,
                    message: message
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                messageInput.value = '';
                await this.loadMessages(this.currentConversation);
                await this.loadConversations(); // Refresh conversations list
            } else {
                alert('Failed to send message: ' + result.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    }

    async searchUsers(query) {
        if (query.length < 2) {
            document.getElementById('userSearchResults').innerHTML = '<p style="text-align: center; color: #718096; padding: 1rem;">Type at least 2 characters to search</p>';
            return;
        }

        try {
            const response = await fetch(`php/api.php?action=search_users&search_term=${encodeURIComponent(query)}&current_user_id=${this.currentUser.id}`);
            const result = await response.json();
            
            const resultsContainer = document.getElementById('userSearchResults');
            if (!resultsContainer) return;

            if (result.success && result.data.length > 0) {
                resultsContainer.innerHTML = result.data.map(user => `
                    <div class="search-result-item" onclick="chatSystem.startNewConversation(${user.id}, '${this.escapeHtml(user.full_name)}')">
                        <div class="avatar">${user.full_name.charAt(0).toUpperCase()}</div>
                        <div>
                            <h4>${this.escapeHtml(user.full_name)}</h4>
                            <p>${user.email} • ${user.user_type}</p>
                            <small>${user.area}, ${user.district}</small>
                        </div>
                    </div>
                `).join('');
            } else {
                resultsContainer.innerHTML = '<p style="text-align: center; color: #718096; padding: 1rem;">No users found. Try a different search term.</p>';
            }
        } catch (error) {
            console.error('Error searching users:', error);
            document.getElementById('userSearchResults').innerHTML = '<p style="text-align: center; color: #f56565; padding: 1rem;">Error searching users</p>';
        }
    }

    async loadQuickContacts() {
        try {
            const response = await fetch(`php/api.php?action=get_recent_contacts&user_id=${this.currentUser.id}`);
            const result = await response.json();
            
            const quickContacts = document.getElementById('quickContacts');
            const recentContacts = document.getElementById('recentContactsList');
            
            if (result.success && result.data.length > 0) {
                const contactsHtml = result.data.slice(0, 5).map(contact => `
                    <div class="quick-contact" onclick="chatSystem.startNewConversation(${contact.id}, '${this.escapeHtml(contact.full_name)}')">
                        <div class="avatar">${contact.full_name.charAt(0).toUpperCase()}</div>
                        <div>
                            <h4>${this.escapeHtml(contact.full_name)}</h4>
                            <small>${contact.user_type}</small>
                        </div>
                    </div>
                `).join('');
                
                if (quickContacts) quickContacts.innerHTML = contactsHtml;
                if (recentContacts) recentContacts.innerHTML = contactsHtml;
            } else {
                if (quickContacts) quickContacts.innerHTML = '<p style="text-align: center; color: #718096;">No recent contacts</p>';
                if (recentContacts) recentContacts.innerHTML = '<p style="text-align: center; color: #718096;">No recent contacts</p>';
            }
        } catch (error) {
            console.error('Error loading quick contacts:', error);
        }
    }

    startNewConversation(userId, userName) {
        this.closeNewConversationModal();
        this.openConversation(userId, userName);
    }

    showNewConversationModal() {
        const modal = document.getElementById('newConversationModal');
        if (modal) {
            modal.style.display = 'flex';
            this.loadQuickContacts();
        }
    }

    closeNewConversationModal() {
        const modal = document.getElementById('newConversationModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('userSearchResults').innerHTML = '<p style="text-align: center; color: #718096; padding: 1rem;">Type to search for users</p>';
            document.getElementById('searchUser').value = '';
        }
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatSystem = new ChatSystem();
    
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});