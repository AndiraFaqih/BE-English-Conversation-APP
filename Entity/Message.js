class Message {
    constructor(idUser, messageText, chatRoomId) {
      this.idUser = idUser;
      this.messageText = messageText;
      this.createdAt = new Date().toISOString();
      this.chatRoomId = chatRoomId;
    }
  
    getAllMessage() {
      return {
        idUser: this.idUser,
        messageText: this.messageText,
        createdAt: this.createdAt,
        chatRoomId: this.chatRoomId,
      };
    }
  }

  module.exports = Message;
  