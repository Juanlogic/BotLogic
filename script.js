const API_URL = "http://13.38.120.239/messages";

class Messenger {
    constructor() {
        this.chats = {};
        this.selectedChat = null;
        this.fetchMessages();
        this.setupRefreshButton();
    }

    async fetchMessages() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error al obtener mensajes");
            const messages = await response.json();
            this.processMessages(messages);
        } catch (error) {
            console.error("Error al obtener mensajes:", error);
        }
    }

    processMessages(messages) {
        messages.forEach(msg => {
            const chatId = msg.chat?.S || 'Desconocido';
            if (!this.chats[chatId]) {
                this.chats[chatId] = {
                    messages: [],
                    lastMessage: null
                };
            }

            this.chats[chatId].messages.push({
                text: msg.text?.S || '',
                timestamp: parseInt(msg.timestamp?.N) || Date.now(),
                role: msg.role?.S || 'user',
            });

            this.chats[chatId].lastMessage = {
                text: msg.text?.S || '',
                timestamp: parseInt(msg.timestamp?.N) || Date.now()
            };
        });

        this.renderChatsList();
    }

    renderChatsList() {
        const chatsListElement = document.getElementById('chatsList');
        const headerElement = chatsListElement.querySelector('.chat-header');

        chatsListElement.innerHTML = headerElement.outerHTML;

        Object.keys(this.chats).forEach(chatId => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');

            const chatFirstLetter = chatId.charAt(0).toUpperCase();

            chatItem.innerHTML = `
                <div class="avatar">${chatFirstLetter}</div>
                <div class="chat-item-info">
                    <div class="chat-item-name">Chat ${chatId}</div>
                    <div class="chat-item-preview">
                        ${this.chats[chatId].lastMessage.text.substring(0, 30)}...
                    </div>
                </div>
            `;

            chatItem.addEventListener('click', () => this.selectChat(chatId));
            chatsListElement.appendChild(chatItem);
        });
    }

    selectChat(chatId) {
        this.selectedChat = chatId;
        this.renderMessages();
    }

    renderMessages() {
        if (!this.selectedChat) return;

        const messages = this.chats[this.selectedChat].messages;
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';

        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', msg.role);

            messageElement.innerHTML = `
                <div class="text">${msg.text}</div>
                <div class="time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(messageElement);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    setupRefreshButton() {
        const refreshButton = document.getElementById('refreshButton');
        refreshButton.addEventListener('click', () => this.fetchMessages());
    }
}

const messenger = new Messenger();

