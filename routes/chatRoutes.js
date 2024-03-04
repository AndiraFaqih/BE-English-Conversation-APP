const express = require("express");
const ChatController = require("../controllers/chatController");
const { authCheck, isUser } = require("../middlewares/auth");

class ChatRoutes {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // this.router.post("/chatroom/:chatRoomId/text-to-audio", authCheck, isUser, ChatController.postChat);
        this.router.post("/chatroom/:chatRoomId/talk-freely", authCheck, isUser, ChatController.postChatText);
        this.router.post("/chatroom/:chatRoomId/grammar", authCheck, isUser, ChatController.postChatGrammar);
        this.router.put("/chatroom/:chatRoomId/edit-text/:idMessage", authCheck, isUser, ChatController.editChat);
        // this.router.put("/chatroom/:chatRoomId/text-to-audio/:idMessage", authCheck, isUser, ChatController.editChatText);
        this.router.put("/chatroom/:chatRoomId", authCheck, isUser, ChatController.editChatRoom);
        this.router.delete("/chatroom/:chatRoomId/chat/:idMessage", authCheck, isUser, ChatController.deleteChat);

        this.router.post("/chatroom-voice", authCheck, isUser, ChatController.createChatRoomVoice);
        this.router.post("/chatroom-grammar", authCheck, isUser, ChatController.createChatRoomText);
        this.router.get("/get-all-chatroom-voice", authCheck, isUser, ChatController.getUserChatRoomVoice);
        this.router.get("/get-all-chatroom-grammar", authCheck, isUser, ChatController.getUserChatRoomText);
        this.router.delete("/chatroom/:chatRoomId", authCheck, isUser, ChatController.deleteChatRoom);
    }

    getRouter() {
        return this.router;
    }
}

module.exports = new ChatRoutes().getRouter();
