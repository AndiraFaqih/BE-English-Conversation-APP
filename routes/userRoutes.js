const express = require("express");
const { authCheck, isUser } = require("../middlewares/auth");
const  controller  = require("../controllers/userController");
const router = express.Router();
const upload = require("../middlewares/multer");

router.post("/profile/edit",authCheck, isUser,upload.single("photoProfile"), controller.updateUserProfile);
router.get("/profile",authCheck, isUser, controller.getUserProfile);
router.delete("/delete",authCheck, isUser, controller.deleteUserAccount);

module.exports = router;