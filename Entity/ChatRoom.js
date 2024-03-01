class ChatRoom {
    constructor(idUser, chatRoomName,type) {
      this.idUser = idUser;
      this.chatRoomName = chatRoomName;
      this.type = type;
      this.createdAt = new Date().toISOString();
    }

    addChatRoom() {
      return {
        idUser: this.idUser,
        chatRoomName: this.chatRoomName,
        type: this.type,
        createdAt: this.createdAt,
      };
    }
  }

    module.exports = ChatRoom;