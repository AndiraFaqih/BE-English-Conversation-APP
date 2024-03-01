class AIMessage {
    constructor(messageId, aiChatResponseText, chatRoomId) {
        this.idMessage = messageId;
        this.AIMessageText = aiChatResponseText;
        this.createdAt = new Date().toISOString();
        this.chatRoomId = chatRoomId;
    }

    getAllAIMessage() {
        return {
            idMessage: this.idMessage,
            AIMessageText: this.AIMessageText,
            createdAt: this.createdAt,
            chatRoomId: this.chatRoomId,
        };
      }
}

module.exports = AIMessage;
