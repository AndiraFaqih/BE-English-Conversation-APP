const express = require("express");
const  controller  = require("../controllers/chatController");
const { authCheck, isUser } = require("../middlewares/auth");
const router = express.Router();

router.post("/roomchat/:chatRoomId/chat",authCheck, isUser, controller.postChat);
router.post("/roomchat/:chatRoomId/speech",authCheck, isUser, controller.postChatText);
router.put("/roomchat/:chatRoomId/chat/:idMessage", authCheck, isUser, controller.editChat);
router.delete("/roomchat/:chatRoomId/chat/:idMessage", authCheck, isUser, controller.deleteChat);

router.post("/roomchat",authCheck, isUser, controller.createChatRoom);
router.get("/roomchat",authCheck, isUser, controller.getUserChatRooms);
router.delete("/roomchat/:chatRoomId", authCheck, isUser, controller.deleteChatRoom);


module.exports = router;