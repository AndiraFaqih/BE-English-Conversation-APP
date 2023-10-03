const express = require("express");
const  controller  = require("../controllers/chatController");
const { authCheck, isUser } = require("../middlewares/auth");
const router = express.Router();

router.post("/chat",authCheck, isUser, controller.postChat);

module.exports = router;