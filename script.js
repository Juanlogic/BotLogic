const API_URL = "http://localhost:3001/messages";

class Messenger {
    constructor() {
        this.chats = {};
        this.selectedChat = null;
        this.initialLoad = true; // Primera carga
        this.fetchMessages();
        this.setupRefreshButton();
    }

    async fetchMessages() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error al obtener mensajes");
            const messages = await response.json();
            this.processMessages(messages);

            // Si hay un chat seleccionado, renderiza mensajes si se actualizó
            if (this.selectedChat && this.chats[this.selectedChat]) {
                this.renderMessages();
            }

            // Después de la primera carga, ya no es el primer load
            this.initialLoad = false;
        } catch (error) {
            console.error("Error al obtener mensajes:", error);
        }
    }

    processMessages(messages) {
        // Crear un objeto temporal para los chats actuales
        const currentChats = {};

        messages.forEach(msg => {
            const chatId = msg.chat?.S || 'Desconocido';
            if (!currentChats[chatId]) {
                currentChats[chatId] = {
                    messages: [],
                    lastMessage: null,
                    isRead: true // Por defecto marcamos como leído
                };
            }

            const messageObj = {
                text: msg.text?.S || '',
                timestamp: parseInt(msg.timestamp?.N) || Date.now(),
                role: msg.role?.S || 'user',
            };

            currentChats[chatId].messages.push(messageObj);
            if (!currentChats[chatId].lastMessage || messageObj.timestamp > currentChats[chatId].lastMessage.timestamp) {
                currentChats[chatId].lastMessage = messageObj;
            }
        });

        if (!this.initialLoad) {
            // Si no es la primera carga, comparamos con el estado anterior
            Object.keys(currentChats).forEach(chatId => {
                const oldChat = this.chats[chatId];
                const newChat = currentChats[chatId];

                if (!oldChat) {
                    // Chat nuevo que no existía antes: no leído
                    newChat.isRead = false;
                } else {
                    // Comparar timestamps para detectar mensajes nuevos
                    const oldTimestamp = oldChat.lastMessage?.timestamp || 0;
                    const newTimestamp = newChat.lastMessage?.timestamp || 0;

                    if (newTimestamp > oldTimestamp) {
                        newChat.isRead = false; // Mensaje más reciente: no leído
                    } else {
                        newChat.isRead = oldChat.isRead; // Mantener estado anterior
                    }
                }
            });
        }
        // Si es la primera carga (this.initialLoad === true), 
        // todos se quedan con isRead = true, es decir, sin resaltar.

        // Actualizar this.chats
        this.chats = currentChats;

        this.renderChatsList();
    }

    renderChatsList() {
        const chatsListElement = document.getElementById('chatsList');

        // Eliminar solo los elementos de chat, manteniendo el header
        Array.from(chatsListElement.children).forEach(child => {
            if (!child.classList.contains('chat-header')) {
                chatsListElement.removeChild(child);
            }
        });

        // Insertar los chats en orden descendente (últimos mensajes al inicio)
        Object.keys(this.chats)
            .sort((a, b) => {
                const timeA = this.chats[a]?.lastMessage?.timestamp || 0;
                const timeB = this.chats[b]?.lastMessage?.timestamp || 0;
                return timeB - timeA; // Orden descendente
            })
            .forEach(chatId => {
                const chatItem = document.createElement('div');
                chatItem.classList.add('chat-item');

                // Si no se ha leído y no es la primera carga, resaltar
                if (!this.chats[chatId].isRead && !this.initialLoad) {
                    chatItem.classList.add('chat-item-new');
                }

                const chatFirstLetter = chatId.charAt(0).toUpperCase();

                chatItem.innerHTML = `
                    <div class="avatar">${chatFirstLetter}</div>
                    <div class="chat-item-info">
                        <div class="chat-item-name">Chat ${chatId}</div>
                        <div class="chat-item-preview">
                            ${this.chats[chatId].lastMessage.text.substring(0, 30)}...
                        </div>
                    </div>
                    <div class="chat-item-icon">
                        <svg width="18" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 25H7.26287L23.7029 8.55996C24.1141 8.14873 24.4403 7.66054 24.6629 7.12324C24.8855 6.58595 25 6.01008 25 5.42852C25 4.84696 24.8855 4.27109 24.6629 3.7338C24.4403 3.19651 24.1141 2.70831 23.7029 2.29708C23.2917 1.88586 22.8035 1.55966 22.2662 1.3371C21.7289 1.11455 21.153 1 20.5715 1C19.9899 1 19.4141 1.11455 18.8768 1.3371C18.3395 1.55966 17.8513 1.88586 17.44 2.29708L1 18.7371V25Z" 
                            stroke="white" stroke-width="1.24583" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                `;

                chatItem.addEventListener('click', () => {
                    this.selectChat(chatId);
                    // Marcar el chat como leído
                    chatItem.classList.remove('chat-item-new');
                    this.chats[chatId].isRead = true;
                });

                // Insertar cada chat al final (debajo del header)
                chatsListElement.appendChild(chatItem);
            });
    }

    selectChat(chatId) {
        this.selectedChat = chatId;
        this.renderMessages();
    }

    renderMessages() {
        if (!this.selectedChat) return;

        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';

        const messages = this.chats[this.selectedChat]?.messages || [];
        if (messages.length === 0) {
            messagesContainer.innerHTML = '<div class="no-messages">No hay mensajes</div>';
            return;
        }

        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', msg.role);

            messageElement.innerHTML = `
                <div class="text">${msg.text}</div>
                <div class="time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(messageElement);
        });

        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 0);
    }

    setupRefreshButton() {
        document.getElementById('refreshButton').addEventListener('click', () => this.fetchMessages());
    }
}

const messenger = new Messenger();
