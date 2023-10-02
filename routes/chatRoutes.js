const express = require("express");
const  controller  = require("../controllers/chatController");
const router = express.Router();

router.post("/chat", controller.postChat);

module.exports = router;